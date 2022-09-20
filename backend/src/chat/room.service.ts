// import { Logger } from '@nestjs/common';
// import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket, MessageBody } from '@nestjs/websockets';
// import { Socket, Server } from 'socket.io';

// import { Injectable } from '@nestjs/common';
// import { ChatCommandsHandler } from './chat.commandFn';
// import { ChanService } from './chan.service';
// import { ChatService } from './chat.service';

export class UserData {
	constructor(login: string, username: string, socketId: string) {
	  this.login = login;
	  this.socketId = socketId;
	  this.username = username;
	}
	login: string;
	username: string;
	socketId: string;
	ban: string[] = [];
	invitePending: boolean = false;
	isInvited: boolean = false;
	isInGame: boolean = false;

	checkBan(b: string) {
		if (this.ban.includes(b))
			return true
		return false
	}

	changeUsername(username: string) {
		this.username = username
	}

	getUserName() {
		return this.username
	}

	getUserLogin() {
		return this.login
	}
}
  
export class Room {
	constructor(roomName: string, ownerLogin: string, username: string, socketId: string) {
	  this.roomName = roomName;
	  this.ownerLogin = ownerLogin;
	  this.admins.push(ownerLogin);
	  this.addUser(ownerLogin, username, socketId)
	};
  
	// https://howtodoinjava.com/typescript/maps/
	roomName: string;
	ownerLogin: string;
	admins= new Array<string>();
	users= new Map<string, UserData>();
	mute= new Map<string, number>();
	ban= new Map<string, number>();
	pw: string;

	getUserNameFromLogin(login: string) {
		for (const [key, value] of this.users) {
			if (key === login) {
				return value.username
			}
		}
	}

	getAdminsUnFromLogin(adms: string[]) {
		let arr = new Array<string>()
		for (const [key, value] of this.users) {
			if (this.isAdmin(key)) {
				arr.push(value.username)
			}
		}
		return arr
	}

	addUser(login: string, username: string, socketId: string) {
	  if (!this.users.has(login)) {
		this.users.set(login, new UserData(login, username, socketId));
	  }
	}

	addUserData(login: string, userData: UserData) {
		this.users.set(login, userData)
	}

	userExists(login: string) {
		if (this.users.has(login))
			return true;
		else
			return false;
	}
  
	removeUser(login: string) {
	  if (this.users.has(login)) {
		this.users.delete(login);
	  }
	}
  
	getUser(login: string) {
	  return this.users.get(login)
	}
  
	getUserSocket(login: string) {
	  return this.getUser(login).socketId;
	}

	isAdmin(login: string) {
		if (this.admins.includes(login))
			return true
		return false
	}

	isOwner(login: string) {
		if (this.ownerLogin === login)
			return true
		return false
	}

	setAdmin(login: string) {
		if (!this.admins.includes(login))
			this.admins.push(login)
	}

	setMuteTime(muted: string, t: number) {
		const mTime = Date.now() + (t * 1000)
		this.mute.set(muted, mTime)
	}

	isMuted(muted: string) {
		if (this.mute.get(muted) < 0)
			return true
		const tNow = Date.now();
		if (this.mute.get(muted) > tNow)
			return true
		return false
	}

	setBanTime(banned: string, t: number) {
		const mTime = Date.now() + (t * 1000)
		this.ban.set(banned, mTime)
	}

	isBanned(banned: string) {
		if (this.ban.get(banned) < 0)
			return true
		const tNow = Date.now();
		if (this.ban.get(banned) > tNow)
			return true
		return false
	}

	getGroup(room: string) {
		return this.users.values()
	}
  }