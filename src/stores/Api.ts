
import { User, Friend, ChatMessage } from '../stores';
import { Friend as Friendpb, Empty, User as Userpb, FriendsList, FriendRequest } from '../_proto/friends_pb';
import { FriendsClient, ServiceError } from '../_proto/friends_pb_service';
import { BrowserHeaders } from 'browser-headers';
import { PresenceClient, ResponseStream } from '../_proto/presence_pb_service';
import { User as UserPesence, OnlineStatus } from '../_proto/presence_pb';

export class Api{
    store: any = null;
    host = window.location.protocol + "//"+window.location.hostname + (window.location.hostname == "localhost" ? ":" + window.location.port : "");

    presenceStreams: {[id:string]:ResponseStream<OnlineStatus>} = {};
    presenceOnlineStreams: {[id:string]:ResponseStream<Empty>} = {}; 
  
    setStore = (store) => {
        this.store = store;
    }


    addFriend = (user: User, friend: Friend) => {
        console.log("api addFriend for: ", {user,friend});
        const friendpb = new Friendpb();
        friendpb.setUser(friend.name);
        friendpb.setAvatar(friend.avatar);
        const friendRequest = new FriendRequest();
        friendRequest.setUser(user.name);
        friendRequest.setFriend(friendpb);
        
        const client = new FriendsClient(this.host);    
        const metadata = new BrowserHeaders({'custom-header-1': 'value1'});
        console.log("friend Request", friendRequest);
        client.add(friendRequest, metadata, (err: ServiceError, response: Empty) => {            
            console.log("err", err);
            const userpb = new Userpb();
            userpb.setUser(user.name)
            client.getFriends(userpb, metadata,  (err: ServiceError, response: FriendsList) => {
                    console.log("getFriends response:", response);
                    if(!err){
                        response.getFriendsList().map( f => {
                            console.log("user: " + user.name + "adding friend", f);
                            this.store.friendStore.addFriend(user, {name: f.getUser(), avatar: f.getAvatar()} as Friend );
                            this.store.userStore.addUser(user, {name: f.getUser(), avatar: f.getAvatar()} as User );
                        })
                    }else{
                        console.error("ERROR getting friends", err);
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
        client.add(friendRequest2, metadata, (err: ServiceError, response: Empty) => {            
            console.log("err", err);
            const userpb = new Userpb();
            userpb.setUser(user.name)
            client.getFriends(userpb, metadata,  (err: ServiceError, response: FriendsList) => {
                    if(!err){
                        response.getFriendsList().map( f => {
                            console.log("user: " + friend.name + "adding friend", user);
                            this.store.friendStore.addFriend(friend as User, user as Friend );                            
                        });
                    }else{
                        console.error("ERROR getting friends", err);
                    }
                });
        });           
    }

    monitorPresence = (user: User) =>{
        console.log("monitorPresence")
        const client = new PresenceClient(this.host);    
        const userpb = new UserPesence();
        userpb.setName(user.name);
        const presenceStream = client.monitor(userpb);
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
        const client = new PresenceClient(this.host);    
        const metadata = new BrowserHeaders({'custom-header-1': 'value1'});
        
        const upb = new Userpb();
        upb.setUser(user.name)
        const fclient = new FriendsClient(this.host,{debug: true});    
        console.log("getFriends", upb);
        console.log("Calling grpc on host: " + this.host)
        fclient.getFriends(upb, metadata,  (err: ServiceError, response: FriendsList) => {
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
        this.presenceOnlineStreams[user.name] = client.connect(userpb, metadata);              
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