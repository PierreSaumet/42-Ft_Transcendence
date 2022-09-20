import { Room } from './room.service'
import { Injectable } from '@nestjs/common';
import { ChatCommandsHandler } from './chat.commandFn';
import { ChatService } from './chat.service';
import { UserData } from './room.service'

@Injectable()
export class ChanService {
	constructor() {
		this.chans.push(new Room('general', null, null, null))
	}

	chans = new Array<Room>();
	chatService : ChatService;
	blockGeneral : Map<string, Array<string>>

	getRoom(roomName: string) {
		return this.chans.find(room => room.roomName === roomName)
	}

	roomExists(roomName: string) {
		if (this.getRoom(roomName))
			return true;
		else
			return false;
	}

	getAllChans() {
		return this.chans
	}

	addRoom(newRoom: Room) {
		this.chans.push(newRoom)
	}

	getUserGn(uLogin: string) {
		for (var room = 0; room < this.chans.length; room++) {
			if (this.chans[room].users.has(uLogin)) {
				return this.chans[room].users.get(uLogin)
			}
		}
		return false
	}

	getUserNameGn(uName: string) {
		for (var room = 0; room < this.chans.length; room++) {
			for (const user of this.chans[room].users.values()) {
				if (user.username === uName) {
					return user
				}
			}
		}
		return false
	}

	updateUserGn(login:string, ud: UserData) {
		this.chans.forEach(room => {
			if (room.users.has(login)) {
				room.removeUser(login)
				room.addUserData(login, ud)
			}
		})
	}

	getUserBySocketId(s: string) {
		for (let i = 0; i < this.chans.length; i++) {
			for (const [key, value] of this.chans[i].users) {
				if (s == value.socketId)
					return key
			  }
		}
	}

	getUserLoginBySocketId(s: string) {
		for (let i = 0; i < this.chans.length; i++) {
			for (const [key, value] of this.chans[i].users) {
				if (s == value.socketId)
					return value.login
			  }
		}
	}

	removeUserGn(u: string) {
		this.chans.forEach(room => {
			if (room.users.has(u)) {
				room.users.delete(u)
			}
		})
	}

	gBlock(u: string, blk: string) {
		const usr = this.getUserGn(u)
		if (!usr)
			return
		if (this.checkGeneralBlock(u, blk))
			return true
		usr.ban.push(blk)
		return true
	}

	checkGeneralBlock(u: string, blk: string) {
		const usr = this.getUserGn(u)
		if (!usr)
			return false
		if (usr.checkBan(blk))
			return true
	}

	getUsersBlocked(u:string) {
		const usr = this.getUserGn(u)
		if (!usr) 
			return
		return usr.ban
	}

}