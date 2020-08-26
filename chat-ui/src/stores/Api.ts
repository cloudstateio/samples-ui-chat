
import { User, Friend, ChatMessage } from '../stores';
import { Friend as Friendpb, Empty, User as Userpb, FriendsList, FriendRequest } from '../_proto/friends_pb';
import { FriendsClient, ServiceError } from '../_proto/friends_pb_service';
import { BrowserHeaders } from 'browser-headers';
import { PresenceClient, ResponseStream } from '../_proto/presence_pb_service';
import { User as UserPesence, OnlineStatus } from '../_proto/presence_pb';

export class Api{
    store: any = null;
    // must preserve host port if explicitly given in browser. eg. http://192.168.1.98:31380/pages/chat.html
    host = window.location.protocol + "//"+window.location.hostname + (window.location.port.length > 0 ? ":" + window.location.port : "");

    presenceStreams: {[id:string]:ResponseStream<OnlineStatus>} = {};
    presenceOnlineStreams: {[id:string]:ResponseStream<Empty>} = {};

    friendClient = new FriendsClient(this.host);
    presenceClient = new PresenceClient(this.host);

    setFriendsHostname = (hostname:string) => {
        this.friendClient = new FriendsClient(hostname);
    }
    setPresenceHostname = (hostname:string) => {
        this.presenceClient = new PresenceClient(hostname);
    }

  
    setStore = (store) => {
        this.store = store;
    }

    getFriends = (user: User) => {
        console.log("api getFriends for: ", user);
        const userpb = new Userpb();
        userpb.setUser(user.name);

        const metadata = new BrowserHeaders({'custom-header-1': 'value1'});
        console.log("getFriends request", userpb);
        return new Promise<void>( (resolve, reject) => {
            this.friendClient.getFriends(userpb, metadata, (err: ServiceError, response: FriendsList) => {
                console.log("getFriends response:", response);
                if (!err) {
                    response.getFriendsList().map(f => {
                        console.log("user: " + user.name + "adding friend", f);
                        this.store.friendStore.addFriend(user, {
                            name: f.getUser(),
                            avatar: f.getAvatar()
                        } as Friend);
                        this.store.userStore.addUser(user, {name: f.getUser(), avatar: f.getAvatar()} as User);
                    });
                    resolve();
                } else {
                    console.error("ERROR getting friends", err);
                    reject(err);
                }
            });
        });
    }

    addFriend = (user: User, friend: Friend) => {
        console.log("api addFriend for: ", {user,friend});
        const friendpb = new Friendpb();
        friendpb.setUser(friend.name);
        friendpb.setAvatar(friend.avatar);
        const friendRequest = new FriendRequest();
        friendRequest.setUser(user.name);
        friendRequest.setFriend(friendpb);

        const metadata = new BrowserHeaders({'custom-header-1': 'value1'});
        console.log("friend Request", friendRequest);
        return new Promise<void>( (resolve, reject) => {
            this.friendClient.add(friendRequest, metadata, (err: ServiceError, response: Empty) => {
                console.log("err", err);
                const userpb = new Userpb();
                userpb.setUser(user.name)
                this.friendClient.getFriends(userpb, metadata, (err: ServiceError, response: FriendsList) => {
                    console.log("getFriends response:", response);
                    if (!err) {
                        response.getFriendsList().map(f => {
                            console.log("user: " + user.name + "adding friend", f);
                            this.store.friendStore.addFriend(user, {
                                name: f.getUser(),
                                avatar: f.getAvatar()
                            } as Friend);
                            this.store.userStore.addUser(user, {name: f.getUser(), avatar: f.getAvatar()} as User);
                        })
                    } else {
                        console.error("ERROR getting friends", err);
                        reject(err);
                    }
                });
            });
            // Reciprical
            const friendRequest2 = new FriendRequest();
            const friendpb2 = new Friendpb();
            friendpb2.setUser(user.name);
            friendpb2.setAvatar(user.avatar);
            friendRequest2.setUser(friend.name);
            friendRequest2.setFriend(friendpb2);
            this.friendClient.add(friendRequest2, metadata, (err: ServiceError, response: Empty) => {
                console.log("err", err);
                const userpb = new Userpb();
                userpb.setUser(user.name)
                this.friendClient.getFriends(userpb, metadata, (err: ServiceError, response: FriendsList) => {
                    if (!err) {
                        response.getFriendsList().map(f => {
                            console.log("user: " + friend.name + "adding friend", user);
                            this.store.friendStore.addFriend(friend as User, user as Friend);
                        });
                        resolve();
                    } else {
                        console.error("ERROR getting friends", err);
                        reject(err);
                    }
                });
            });
        });
    }

    monitorPresence = (user: User) =>{
        console.log("monitorPresence")
        const userpb = new UserPesence();
        userpb.setName(user.name);
        const presenceStream = this.presenceClient.monitor(userpb);
        if(this.presenceStreams[user.name])delete this.presenceStreams[user.name];
        this.presenceStreams[user.name] = presenceStream;
        console.log("monitor presence of user: ", user);        
        presenceStream.on("status", (status) =>{
            console.log("status for: " + user.name, status);
            if(status.code == 0){   // connection ok
                //this.store.userStore.users[user.name].online = false;                
            }
        });
        presenceStream.on("end", () =>{
            console.log("stream end for user", user);
            this.store.userStore.users[user.name].online = false;
        });        
    }

    addUser = (user: User) => {
        console.log("addUser", user);
        this.store.userStore.addUser( {...user, online: true} );
        const metadata = new BrowserHeaders({'custom-header-1': 'value1'});
        
        const upb = new Userpb();
        upb.setUser(user.name)
        console.log("getFriends", upb);
        console.log("Calling grpc on host: " + this.host)
        this.friendClient.getFriends(upb, metadata,  (err: ServiceError, response: FriendsList) => {
            console.log("GOT", response)
            if(!err){
                response.getFriendsList().map( f => {
                    console.log("user: " + user.name + "adding friend", f);
                    this.store.friendStore.addFriend(user, {name: f.getUser(), avatar: f.getAvatar()} as Friend );
                    if(!this.store.userStore.users[f.getUser()]){
                        const u = {name: f.getUser(), avatar: f.getAvatar(), online: false} as User;
                        this.store.userStore.addUser(u);
                        this.monitorPresence(u);
                    }
                })
            }else{
                console.error("ERROR getting friends", err);
            }
        });
        const userpb = new UserPesence();
        userpb.setName(user.name);
        console.log("connect presence", user);
        this.presenceOnlineStreams[user.name] = this.presenceClient.connect(userpb, metadata);
    }

    testPresenceConnection = () => {
        console.log("testPresenceConnection");
        return new Promise<void>( (resolve, reject) => {
            const userpb = new UserPesence();
            userpb.setName("connection-test");
            let cancelable = setTimeout(() =>{
                resolve();
            }, 1000);
            this.presenceClient.connect(userpb, undefined)
                .on("status", (status) => {
                    console.log("status", status);
                    clearTimeout(cancelable);
                    if(status.code != 0)reject(status.details)
                    else resolve();
                })
                .on("end", (status) => {
                    console.log("end", status);
                    clearTimeout(cancelable);
                    if(status.code != 0)reject(status.details)
                    else resolve();
                }).on("data", (data) => {
                    console.log("data", data);
                    clearTimeout(cancelable);
                    resolve();
                });
        });
    }

    userOffline = (user: User) => {
        console.log("user: " + user.name + " going offline");
        this.store.userStore.users[user.name].online = false;
        if(this.presenceOnlineStreams[user.name]){
            console.log("cancel presence stream for user: " + user.name);
            this.presenceOnlineStreams[user.name].cancel();
            delete this.presenceStreams[user.name];
        }
    }
}


export default Api;