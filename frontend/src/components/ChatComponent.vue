<template >
    <div class="chat-container">
        <p style="font-size: 50px; text-align: center;">&emsp;CHAT&emsp;&emsp;</p>
        <div class="chat-container-content" >
            <p style="text-align: center;" > CURRENT CHANNEL: <span style="font-style: italic;">#{{ activeRoom }}</span> </p>
            <div class="chat-msg">
                <ul class="chat-list">
                    <li id="scrollthis" v-for="(msg) of msg_map.get(activeRoom)" :key="msg" style="max-width:350px; overflow-wrap: break-word;">
                        <p v-if="msg.username != ''">
                            <strong>{{ msg.username }} :</strong> {{ msg.message }}
                        </p>
                        <p v-else>
                            {{ msg.message }}
                        </p>  
                    </li>
                </ul>
            </div>
            <div>
                <form class="chat-form">
                    <input v-model="text" type="text" placeholder="Please write what you want..." maxlength="250" minlength="1">
                    <button type="submit" @click.prevent="sendChatMessage()">></button>
                </form>
            </div>
        </div>
    </div>
</template>

<script lang="ts" > 
import io from 'socket.io-client';
// import * as io from 'socket.io-client'
import store from '@/store';
import {Vue, Options} from 'vue-class-component';
import router from '@/router';

@Options({
    name: 'ChatComponent',
})
/* eslint-disable  @typescript-eslint/no-explicit-any */
export default class ChatComponent extends Vue {
    login: string;
    username: string;
    activeRoom = 'general'
    text = ''
    messages: any[] = [] 
    msg_map: Map<string, Array<any>> = new Map()
    rooms: Map<string, boolean> = new Map([
        ['general', true]
    ])
    socket = io('http://localhost:8081/chat')
    opponentUName: ''
    opponentLogin: ''

    isMemberOfActiveRoom() {
        return this.rooms.get(this.activeRoom);
    }

    sendChatMessage() {
        if (this.text.length < 1) {
            return;
        }
        if (this.isMemberOfActiveRoom()) {
            this.socket.emit('chatToServer', {
                sender: this.login,
                username: store.state.user.username,
                room: this.activeRoom,
                message: this.text,
                opponentUName: this.opponentUName,
                opponentLogin: this.opponentLogin,
            });
            // // // // console.log(`${this.login} ${this.activeRoom} ${this.text}`)
            this.text = '';
        } else {
            alert('You are not a member of this group');
        }
    }

    receiveChatMessage(msg: any) {
        if (msg.room == this.activeRoom) {
            this.messages.push(msg)
            this.msg_map.set(this.activeRoom, this.messages)
        }
        let elem = document.getElementById('scrollthis') as HTMLElement;
        if (elem)
            elem.scrollTop = elem.scrollHeight
    }

    createRoom(msg: any) {
        this.activeRoom = msg.newRoom;
        this.msg_map.set(this.activeRoom, this.messages)
        this.rooms.set(msg.room, false)
        this.rooms.set(this.activeRoom, true);
    }

    created() {
        this.socket.on('handleCmd', (msg: any) => {
            if (msg.cmd == 'create' || msg.cmd == 'join') {
                this.createRoom(msg);
            }
        });
        // // // // // console.log('socket: ', this.socket.id)
        this.socket.on('chatToClient', (msg: any) => {
            this.receiveChatMessage(msg);
        });

        this.socket.on('connect', () => {
            this.login = store.state.user.login42;
            this.username = store.state.user.username;
            this.messages.push({
                username: 'server',
                message: 'Welcome! Type /help if you need any assistance.'
            })
            this.msg_map.set(this.activeRoom, this.messages)
            this.socket.emit('joinRoom', {
                room: this.activeRoom,
                login: this.login,
                username: this.username
            });
        });

        this.socket.on('disconnect', () => {
            // // // // console.log('avant sotre dispatch')
            // store.dispatch('putoffline')
            // // // // console.log('apres sotre dispatch')
            this.socket.emit('disconnect', {
                // room: this.activeRoom,
                // login: this.login,
                // id: store.state.user.id
            })
        });

        this.socket.on('invite', (msg: any) => {
            this.messages.push({
                username: 'server',
                message: msg.message
            })
            this.msg_map.set(this.activeRoom, this.messages)
            this.opponentUName = msg.username;
            this.opponentLogin = msg.login;
            setTimeout( () => {
                this.opponentUName = ''
                this.opponentLogin = ''
            }, 30000);
        })

        this.socket.on('gameStart', (msg: any) => {
            this.messages.push({
                username: 'server',
                message: `${msg.username} has started a game with you.`
            })
            this.msg_map.set(this.activeRoom, this.messages)
            router.push('/game/' + msg.id)
        })

        this.socket.on('joinedRoom', (room: any) => {
            this.rooms.set(room, true);
            this.activeRoom = room
            this.messages.push({
                username: 'server',
                room: this.activeRoom,
                message: `You have joined ${this.activeRoom}`
            })
        })

        this.socket.on('createdRoom', (room: any) => {
            this.rooms.set(room, true);
            this.activeRoom = room
            this.messages.push({
                username: 'server',
                room: this.activeRoom,
                message: `You have created ${this.activeRoom}`
            })
        })

        this.socket.on('leftRoom', (room: any) => {
            this.rooms.set(room, false);
        })

        this.socket.on('pm', (msg: any) => {
            this.messages.push({
                username: msg.sender,
                message: msg.message
            })
            this.msg_map.set(this.activeRoom, this.messages)
        })

        this.socket.on('profile', (msg: any) => {
            router.push('/profile/'+ msg.user);
        })

        this.socket.on('delete', (msg: any) => {
            this.socket.emit('decoN', {room: this.activeRoom, gRoom: 'general'});
            this.messages.push({
                username: 'server',
                message: msg.message
            })
            this.activeRoom = 'general'
            this.rooms.set(this.activeRoom, true)
            // // // // // console.log("MESSAGES: " + this.messages + "ACTIVE RM " + this.activeRoom)
            this.socket.emit('joinRoom', {room: this.activeRoom, login: this.login})
            this.msg_map.set(this.activeRoom, this.messages)

        })

        this.socket.on('viewprofile', () => {
            router.push('/edit')
        })

        this.socket.on('serverResponse', (msg: any) => {
            this.messages.push({
                username: 'server',
                room: this.activeRoom,
                message: msg.message
            })
            this.msg_map.set(this.activeRoom, this.messages)
        })

        this.socket.on('help', () => {
            this.messages.push({
                username: 'server',
                room: this.activeRoom,
                message: 'Welcome to the help assistant. The available chat commands are: '
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /create [roomName] (pw). To create a new room.',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /delete [roomName]. To delete a room, if you are room owner',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /blockusr [userName]. To block a user from fully.',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /unblock [userName]. To unblock a user.',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /join [roomName] (pw). To join a room with an optional password.',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /pm [userName] message...',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /help (anything you like). Because You seem a bit lost.',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /admin [userName] Owner can set new admin in channel.',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /mute [userName] (mute time in seconds). Mutes a user from current room.',
                b: true
            }) 
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /unmute [userName] from current room',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /ban [userName] (ban time in seconds). Bans from current room.',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /unban [userName] from current room',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /pw [pw]. Sets Channel password',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /unpw. Removes Channel password',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /printUsers. Prints users in current room',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /printChannels. Prints channels in server',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /leave. Leaves current room',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /profile [userName]. View profile of user',     
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /invite [userName]. Invites user to a game.',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /accept. Accept a game invitation.',
                b: true
            })
            this.messages.push({
                username: '',
                room: this.activeRoom,
                message: '- /kick [userName]. Kick a user from current room',
                b: true
            })
            
        })
    }
}

</script>

<style>

.view-container p {
	text-align: center;
	font-size: 50px;
}

.view-container {
	margin-top: 77px;
	width: 70%;
	float: right;
	border: 2px solid green;
	height: 100%;
	color: bisque;
	overflow-y: scroll;
}

.chat-container {
    margin-top: 78px;
    border: 2px solid red;
    width: 30%;
    height: 100%;
    overflow-y: scroll;
    margin-bottom: 50px;
    scroll-behavior: auto;
}

.chat-container p {
    color: bisque;
    font-size: 20px;
}

.chat-form {
    position: fixed;
    width: 30%;
    bottom: 0px;
}

.chat-form input {
    width: 75%;
    height: 50px;
    border-radius: 10px;
}

.chat-form button {
    width: 25%;
    height: 50px;
    border-radius: 10px;
}

.chat-list {
    list-style-type: none;
}


</style>
