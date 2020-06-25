import { RouterStore } from 'mobx-react-router';
import { observable, computed, toJS } from 'mobx';
import { Api } from './Api'

const routingStore = new RouterStore();
//const apiController = new ApiController();


export interface User{
    name: string;
    avatar: string;
    online: boolean;
}

export interface Friend{
    name: string;
    avatar: string;
}

export interface ChatMessage{
    from: User;
    to: User;
    msg: string;
}

class UserStore{
    @observable users: { [id:string]:User } = {};    
    @computed get stream(){
        return Object.keys(this.users).map(x => this.users[x]).sort( (a, b) => a.name.localeCompare(b.name) )
    }
    addUser(u: User) {
        this.users[u.name] = u
    }
    addUserList(list: User[]){
        list.map( x => this.addUser(x));
    }   
    removeUser(u: User){
        delete this.users[u.name];
    }
}

class FriendStore{
    @observable friends: { [id:string]:Friend[] } = {};        
    addFriend(u: User, f: Friend) {
        if(!this.friends[u.name])this.friends[u.name] = [];
        console.log("FriendStore: " + u.name, f);
        this.friends[u.name] = [...this.friends[u.name].filter(x => x.name != f.name), f];
        if(!this.friends[f.name])this.friends[f.name] = [];
        console.log("FriendStore: " + f.name, u as Friend);
        this.friends[f.name] = [...this.friends[f.name].filter(x => x.name != u.name), u as Friend]
    }   
}

class ChatStore{
    @observable chats: { [id:string]:ChatMessage[] } = {};     
    mkKey = (name1: string, name2: string) => [name1, name2].sort( (a, b) => b.localeCompare(a) ).join("-")
    addChatMessage(u: User, m: ChatMessage) {
        const key = this.mkKey(u.name, m.to.name);
        if(!this.chats[key])this.chats[key] = [];
        this.chats[key] = [...this.chats[key], m];        
    }  
    getChatMessages(u: User, friend: User){
        const key = this.mkKey(u.name, friend.name);
        return this.chats[key] || [];
    } 
}


const userStore = new UserStore();
const friendStore = new FriendStore();
const chatStore = new ChatStore();
const api = new Api();


const stores = {
    routing: routingStore, 
    userStore,
    friendStore,
    chatStore,
    api,
} 

api.setStore(stores);

export default stores;