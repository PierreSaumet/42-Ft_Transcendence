import { Socket, Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ChanService } from './chan.service';
import { Room } from './room.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatCommandsHandler {
	
	constructor(private readonly userService: UserService) {}
	
	//message = sender, room, message
	async create (message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (!chanService.roomExists(msg[1]) && (msg.length <= 3 && msg.length > 1)) {
			const nRoom = new Room(msg[1], message.sender, message.username, client.id)
			chanService.addRoom(nRoom)
			if (msg.length === 3) {
				nRoom.pw = msg[2]
			}
			const currRoom = chanService.getRoom(message.room)
			const myUser = currRoom.getUser(message.sender)
			nRoom.removeUser(message.sender)
			nRoom.addUserData(myUser.login, myUser)
			currRoom.removeUser(message.sender)
			client.leave(message.room);
			client.join(msg[1]);
    		client.emit('createdRoom', msg[1]);
			client.emit('handleCmd', {
				sender: message.username,
				room: message.room,
				message: 'switched to new room',
				cmd: 'create',
				newRoom: msg[1]
			});
			// // // // console.log('New room: ', nRoom)
		} else if (chanService.roomExists(msg[1])) {
			client.emit('serverResponse', {
				message: `A room named: ${msg[1]} already exists`
			})
		} else {
			client.emit('serverResponse', {
				message: 'Your command failed. Please type /help if you want to learn about the available commands',
			})
		}
	}

	async edit (message: any, chanService: ChanService, client: Socket) 
	{
		const msg = message.message.split(' ')
		client.emit('viewprofile', {
			user: `${msg[1]}`
		})
	}
	async join (message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		const tRoom = chanService.getRoom(msg[1])
		if (chanService.roomExists(msg[1]) && (msg.length <= 3 && msg.length > 1)) {
			if (tRoom.pw !== msg[2] && tRoom.pw && tRoom.pw !== '') {
				client.emit('serverResponse', {
					message: 'You have entered the wrong password.'
				})
				return
			}
			if (tRoom.isBanned(message.sender)) {
				client.emit('serverResponse', {
					message: `You are banned from channel: ${msg[1]}.`
				})
				return
			}
			if (tRoom.roomName === message.room) {
				client.emit('serverResponse', {
					message: `You are already in channel: ${msg[1]}.`
				})
				return
			}
			const myUser = chanService.getRoom(message.room).getUser(message.sender)
			tRoom.addUserData(myUser.login, myUser)
			chanService.getRoom(message.room).removeUser(message.sender)
			// tRoom.addUser(message.sender, message.username, client.id)
			client.leave(message.room);
			client.join(msg[1]);
    		client.emit('joinedRoom', msg[1]);
			client.emit('handleCmd', {
				sender: message.username,
				room: message.room,
				message: 'switched to new room',
				cmd: 'join',
				newRoom: msg[1]
			});
		} else if (!chanService.roomExists(msg[1])) {
			client.emit('serverResponse', {
				message: `Room ${msg[1]} does not exist.`,
			})
		} else {
			client.emit('serverResponse', {
				message: 'Your command failed. Please type /help if you want to learn about the available commands',
			})
		}
	}

	async pm (message: any, chanService: ChanService, client: Socket, server: Server) {
		const msg = message.message.split(' ')
		const gUser = chanService.getUserNameGn(msg[1])
		if (!gUser){
			client.emit('serverResponse', {
				message: 'The user you requested is not currently in any room.'
			})
			return
		}
		// // // // console.log('GUSER : ', gUser)
		const amBlocked = chanService.checkGeneralBlock(gUser.login, message.sender)
		const isBlocked = chanService.checkGeneralBlock(message.sender, gUser.login)
		// // // // console.log('amBlocked : ', amBlocked)
		if (isBlocked) {
			client.emit('serverResponse', {
				message: `User is blocked`
			})
		} else if (amBlocked) {
			return
		} else {
			const sendMsg = msg.slice(2).join(' ')
			if (msg.length > 2) {
				// // // console.log(message.username)
				server.to(gUser.socketId).emit('pm', {
					sender: message.username,
					message: sendMsg
				})
				client.emit('pm', {
					sender: message.username,
					message: sendMsg
				})
			}
		}
	}

	async help(message: any, chanService: ChanService, client: Socket) {
		client.emit('help', {})
	}

	async delete (message: any, chanService: ChanService, client: Socket, server: Server) {
		const msg = message.message.split(' ');
		if (msg.length != 2) {
			client.emit('serverResponse', {
				message: '/delete works with 2 arguments: /delete [roomName]'
			})
			return
		} else if (!chanService.roomExists(msg[1])) {
			client.emit('serverResponse', {
				message: `Room ${msg[1]} does not exist.`
			})
			return
		}
		const tRoom = chanService.getRoom(msg[1])
		if (tRoom.roomName === 'general')
			return
		if (!tRoom.isOwner(message.sender)) {
			client.emit('serverResponse', {
				message: 'Only the room owner can delete the room.'
			})
			return
		}
		// const users = chanService.getRoom(msg[1]).users
		// // // // // console.log("ALL CHANS: ", chanService.getAllChans())
		for (let i = 0; i < chanService.chans.length; i++) {
			if (chanService.chans[i].roomName === msg[1]) {
				server.to(msg[1]).emit('delete', {
					message: `Room has been deleted by ${message.sender} you've been moved to #general`
				})
				chanService.chans.splice(i, 1)
			}
		}
		client.emit('delete', {
			message: `${msg[1]} deleted!`
		})
	}

	async mute (message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (msg.length > 3 || msg.length <= 1){
			client.emit('serverResponse', {
				message: '/mute works with 1 or 2 arguments: /mute [usrName] (time to mute in seconds). The user will be muted from this channel if you have the proper rights'
			})
			return
		}
		if (!chanService.getUserNameGn(msg[1])) {
			client.emit('serverResponse', {
				message: `Cannot mute: ${msg[1]}. The user does not exist on this server.`
			})
			return
		}
		const tRoom = chanService.getRoom(message.room)
		const toMute = chanService.getUserNameGn(msg[1])
		if (!toMute)
			return
		if (msg.length === 3) {
			const num = parseInt(msg[2])
			// // console.log(num)
			// // console.log(isNaN(num))
			if ( isNaN(num) ) {
				client.emit('serverResponse', {
					message: '/mute second argument must be a number.'
				})
				return
			}
			if (tRoom.isAdmin(message.sender) && !tRoom.isOwner(toMute.login)) {
				tRoom.setMuteTime(msg[1], msg[2])
				client.emit('serverResponse', {
					message: `${msg[1]} has been muted for ${num} secondes in this channel.`
				})
			} else if (tRoom.isOwner(toMute.login)) {
				client.emit('serverResponse', {
					message: 'You cannot mute the owner of the channel.'
				})
			} else {
				client.emit('serverResponse', {
					message: `You do not have the rights to mute someone on in this channel.`
				})
			}
			return
		}
		if (tRoom.isAdmin(message.sender) && !tRoom.isOwner(toMute.login)) {
			tRoom.mute.set(toMute.login, -1)
			client.emit('serverResponse', {
				message: `${msg[1]} has been muted in the current channel`
			})
		} else if (tRoom.isOwner(toMute.login)) {
			client.emit('serverResponse', {
				message: 'You cannot mute the owner of the channel.'
			})
		} else {
			client.emit('serverResponse', {
				message: `You do not have the rights to mute someone on in this channel.`
			})
		}
	}

	async unmute (message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (msg.length != 2) {
			client.emit('serverResponse', {
				message: '/unmute works with 2 arguments: /unmute [userName]'
			})
			return
		}
		const toUnMute = chanService.getUserNameGn(msg[1])
		if (!toUnMute) {
			client.emit('serverResponse', {
				message: `User ${msg[1]} is not connected to this server or does not exist.`
			})
			return
		}
		if (message.sender === toUnMute.login) {
			client.emit('serverResponse', {
				message: `Cannot mute/unmute yourself...`
			})
			return
		}
		const tRoom = chanService.getRoom(message.room)
		if (!tRoom.isAdmin(message.sender)){
			client.emit('serverResponse', {
				message: `You do not have the rights to unmute someone on in this channel.`
			})
			return
		}
		if (tRoom.mute.delete(toUnMute.login)) {
			client.emit('serverResponse', {
				message: `You have successfully unmuted ${msg[1]}`
			})
		} else {
			client.emit('serverResponse', {
				message: `${msg[1]} is not muted in this channel.`
			})
		}
	}

	async ban(message: any, chanService: ChanService, client: Socket, server: Server) {
		const msg = message.message.split(' ')
		if (msg.length > 3 || msg.length <= 1){
			client.emit('serverResponse', {
				message: '/ban works with 1 or 2 arguments: /ban [usrName] (time to ban in seconds). The user will be banned from this channel if you have the proper rights'
			})
			return
		}
		const toBan = chanService.getUserNameGn(msg[1])
		if (!toBan) {
			client.emit('serverResponse', {
				message: `Cannot ban: ${msg[1]}. The user does not exist on this server.`
			})
			return
		}
		const tRoom = chanService.getRoom(message.room)
		if (msg.length === 3) {
			const num = parseInt(msg[2])
			if ( isNaN(num) ) {
				client.emit('serverResponse', {
					message: '/ban second argument must be a number.'
				})
				return
			}
			if ((tRoom.isAdmin(message.sender) && !tRoom.isOwner(toBan.login))) {
				tRoom.setBanTime(toBan.login, msg[2])
				client.emit('serverResponse', {
					message: `${msg[1]} has been banned for ${num} secondes in this channel.`
				})
			} else if (tRoom.isOwner(toBan.login)) {
				client.emit('serverResponse', {
					message: 'You cannot ban the owner of the channel.'
				})
			} else {
				client.emit('serverResponse', {
					message: `You do not have the rights to ban someone on in this channel.`
				})
			}
			return
		}
		if (tRoom.isAdmin(message.sender) && !tRoom.isOwner(toBan.login)) {
			tRoom.ban.set(toBan.login, -1)
			client.emit('serverResponse', {
				message: `${msg[1]} has been banned in the current channel`
			})
		} else if (tRoom.isOwner(toBan.login)) {
			client.emit('serverResponse', {
				message: 'You cannot ban the owner of the channel.'
			})
		} else {
			client.emit('serverResponse', {
				message: `You do not have the rights to ban someone on in this channel.`
			})
		}
	}

	async unban(message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (msg.length != 2) {
			client.emit('serverResponse', {
				message: '/unban works with 2 arguments: /unban [userName]'
			})
			return
		}
		const toUnBan = chanService.getUserNameGn(msg[1])
		if (!toUnBan) {
			client.emit('serverResponse', {
				message: `User ${msg[1]} is not connected to this server or does not exist.`
			})
			return
		}
		if (message.sender === toUnBan.login) {
			client.emit('serverResponse', {
				message: `Cannot ban/unban yourself...`
			})
			return
		}
		const tRoom = chanService.getRoom(message.room)
		if (!tRoom.isAdmin(message.sender)){
			client.emit('serverResponse', {
				message: `You do not have the rights to unban someone on in this channel.`
			})
			return
		}
		if (tRoom.ban.delete(toUnBan.login)) {
			client.emit('serverResponse', {
				message: `You have successfully unbanned ${msg[1]}`
			})
		} else {
			client.emit('serverResponse', {
				message: `${msg[1]} is not banned in this channel.`
			})
		}
	}

	async blockusr (message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (msg.length != 2) {
			client.emit('serverResponse', {
				message: '/blockusr works with 2 arguments: /blockusr [usrName]'
			})
			return
		}
		const toBlock = chanService.getUserNameGn(msg[1])
		if (!toBlock) {
			client.emit('serverResponse', {
				message: `User ${msg[1]} is not connected to this server or does not exist.`
			})
			return
		}
		if (message.sender === toBlock.login) {
			client.emit('serverResponse', {
				message: `Cannot block/unblock yourself...`
			})
			return
		}
		if (chanService.checkGeneralBlock(message.sender, toBlock.login)) {
			client.emit('serverResponse', {
				message: `User ${msg[1]} is already blocked`
			})
			return
		}
		const res = chanService.gBlock(message.sender, toBlock.login)
		if (res) {
			client.emit('serverResponse', {
				message: `Success, you have blocked ${msg[1]}`
			})
		} else {
			client.emit('serverResponse', {
				message: 'Your command failed. Please type /help if you want to learn about the available commands'
			})
			return
		}
	}

	async unblock(message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (msg.length != 2) {
			client.emit('serverResponse', {
				message: '/unblock works with 2 arguments: /unblock [usrName]'
			})
			return
		}
		const toUnBlock = chanService.getUserNameGn(msg[1])
		if (!toUnBlock) {
			client.emit('serverResponse', {
				message: `User ${msg[1]} is not connected to this server or does not exist.`
			})
			return
		}
		if (message.sender === toUnBlock.login) {
			client.emit('serverResponse', {
				message: `Cannot block/unblock yourself...`
			})
			return
		}
		const u = chanService.getUserGn(message.sender)
		if (u && u.checkBan(toUnBlock.login)) {
			for (let i = 0; i < u.ban.length; i++) {
				if (u.ban[i] === toUnBlock.login) {
					u.ban.splice(i, 1)
				}
			}
			chanService.updateUserGn(u.login, u)
			client.emit('serverResponse', {
				message: `User ${msg[1]} has been unblocked.`
			})
		}
	}

	async admin(message: any, chanService: ChanService, client: Socket) { 
		const msg = message.message.split(' ')
		if (msg.length != 2) {
			client.emit('serverResponse', {
				message: '/admin works with 2 arguments: /admin [usrName]'
			})
			return
		} 
		const newAdmin = chanService.getUserNameGn(msg[1])
		if (!newAdmin) {
			client.emit('serverResponse', {
				message: `User ${msg[1]} is not connected to this server or does not exist.`
			})
			return
		}
		if (message.sender === newAdmin.login) {
			client.emit('serverResponse', {
				message: `Cannot make yourself admin...`
			})
			return
		}
		const tRoom = chanService.getRoom(message.room)
		if (tRoom.isAdmin(message.sender)) {
			tRoom.setAdmin(newAdmin.login)
			client.emit('serverResponse', {
				message: `${msg[1]} has been made admin in this channel.`
			})
		} else {
			client.emit('serverResponse', {
				message: `You do not have the rights to make someone admin on in this channel.`
			})
		}
	}

	async pw(message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (msg.length != 2) {
			client.emit('serverResponse', {
				message: '/pw works with 2 arguments: /pw [newPassword]'
			})
			return
		}
		const tRoom = chanService.getRoom(message.room)
		if (!tRoom.isOwner(message.sender)) {
			client.emit('serverResponse', {
				message: `Only owner can change pw...`
			})
			return
		}
		tRoom.pw = msg[1]	
		client.emit('serverResponse', {
			message: `Password has been set.`
		})
	}

	async unpw(message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (msg.length != 1) {
			client.emit('serverResponse', {
				message: '/unpw works with 1 argument: /unpw'
			})
			return
		}
		const tRoom = chanService.getRoom(message.room)
		if (!tRoom.isOwner(message.sender)) {
			client.emit('serverResponse', {
				message: `Only owner can remove pw...`
			})
			return
		}
		tRoom.pw = undefined
		client.emit('serverResponse', {
			message: `Password has been unset.`
		})
	}


	async printUsers(message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (msg.length != 1) {
			client.emit('serverResponse', {
				message: '/printUsersInGroup works with 1 argument: /printUsersInGroup'
			})
			return
		}
		const tRoom = chanService.getRoom(message.room)
		let ks: Array<string> = []
		tRoom.users.forEach((v, k) => {
			if (k === null)
				return
			ks.push(v.username)
		})
		const ownerUN: string = tRoom.getUserNameFromLogin(tRoom.ownerLogin)
		let adms: string[] = tRoom.getAdminsUnFromLogin(tRoom.admins)
		if (ownerUN === null || adms.length === 0) {
			client.emit('serverResponse', {
				message: `Room ${message.room} Users: ${ks.join(",\n")}`
			});
		}
		if (tRoom.ownerLogin !== null && !tRoom.admins.includes(null)) {
			client.emit('serverResponse', {
				message: `Room ${message.room} Owner: ${ownerUN} | Admins: ${adms.join(",\n")} | Users: ${ks.join(",\n")}`
			});
			return
		}
		if (!tRoom.admins.includes(null)) {
			client.emit('serverResponse', {
				message: `Room ${message.room} Admins: ${adms.join(",\n")} | Users: ${ks.join(",\n")}`
			});
		} else {
			client.emit('serverResponse', {
				message: `Room ${message.room} Users: ${ks.join(",\n")}`
			});
		}
	}

	async printChannels(message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (msg.length != 1) {
			client.emit('serverResponse', {
				message: '/printChannels works with 1 argument: /printChannels'
			})
			return
		}
		// let ks = Array.from(chanService.chans.keys())
		let ks = chanService.chans
		if (ks.length === 0) {
			client.emit('serverResponse', {
				message: 'No channels exist.'
			});
			return
		}
		let x: string[] = []
		for (let i = 0; i < ks.length; i++) {
			x.push(ks[i].roomName)
		}
		client.emit('serverResponse', {
			message: `Channels: ${x.join(",\n")}`
		});
	}

	async leave(message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (msg.length != 1) {
			client.emit('serverResponse', {
				message: '/leave works with 1 argument: /leave'
			})
			return
		}
		const gRoom = chanService.getRoom('general')
		const myUser = chanService.getUserGn(message.sender)
		gRoom.removeUser(message.sender)
		if (myUser) {
			gRoom.addUserData(myUser.login, myUser)
		}
		const tRoom = chanService.getRoom(message.room)
		tRoom.removeUser(message.sender)
		client.emit('delete', {
			message: `You have left the channel.`
		});
	}

	async kick(message: any, chanService: ChanService, client: Socket, server: Server) {
		const msg = message.message.split(' ')
		if (msg.length != 2) {
			client.emit('serverResponse', {
				message: '/kick works with 2 arguments: /kick [username]'
			})
			return
		}
		const tRoom = chanService.getRoom(message.room)
		if (!tRoom.isAdmin(message.sender)) {
			client.emit('serverResponse', {
				message: `You do not have the rights to kick someone from this channel.`
			})
			return
		}
		const toKick = chanService.getUserNameGn(msg[1])
		if (!toKick)
			return
		if (tRoom.ownerLogin === toKick.login) {
			client.emit('serverResponse', {
				message: `You cannot kick the owner of this channel.`
			})
			return
		}
		const user = chanService.getRoom(message.room).getUser(toKick.login)
		if (!user) {
			client.emit('serverResponse', {
				message: `User ${msg[1]} is not in this channel.`
			})
			return
		}
		tRoom.removeUser(toKick.login)
		server.to(user.socketId).emit('delete', {
			message: `You have been kicked from the channel.`
		});
		server.to(message.room).emit('serverResponse', {
			message: `${msg[1]} has been kicked from this channel.`
		})
	}

	async profile(message: any, chanService: ChanService, client: Socket) {
		const msg = message.message.split(' ')
		if (msg.length != 2) {
			client.emit('serverResponse', {
				message: '/profile works with 2 arguments: /profile [username]'
			})
			return
		}
		if (!chanService.getUserGn(msg[1])) {
			client.emit('serverResponse', {
				message: `User ${msg[1]} is not currently connected to server.`
			})
			return
		} else {
			client.emit('profile', {
				user: msg[1],
				// message: `User ${msg[1]} is currently connected to server.`
			})
		}
	}

	async invite(message: any, chanService: ChanService, client: Socket, server: Server) {
		const msg = message.message.split(' ')
		if (msg.length != 2) {
			client.emit('serverResponse', {
				message: '/invite works with 2 arguments: /invite [username]'
			})
			return
		}
		if (message.sender === msg[1]) {
			client.emit('serverResponse', {
				message: `Cannot invite yourself...`
			})
			return
		}
		const opponent = chanService.getUserNameGn(msg[1])
		if (!opponent) {
			client.emit('serverResponse', {
				message: `User ${msg[1]} is not currently connected to server.`
			})
			return
		}
		const challenger = chanService.getRoom(message.room).getUser(message.sender)
		if (!challenger || challenger.invitePending === true) {
			client.emit('serverResponse', {
				message: `You already have a pending invite.`
			})
			return
		}
		if (opponent.isInvited) {
			client.emit('serverResponse', {
				message: `User ${msg[1]} already has a pending invite. Try again later.`
			})
			return
		}
		if (opponent.checkBan(message.sender)) {
			client.emit('serverResponse', {
				message: `The user you are trying to invite has blocked you.`
			})
			return
		} else {
			client.emit('serverResponse', {
				message: `User ${msg[1]} has been invited to a game. The invitation will last 30 seconds.`
			})
			server.to(opponent.socketId).emit('invite', {
				username: challenger.username,
				login: challenger.login,
				message: `You have been invited to a game by ${challenger.username}. Invitation will last 30 seconds`
			})
			challenger.invitePending = true
			opponent.isInvited = true
			setTimeout(() => {
				client.emit('serverResponse', {
					message: `Your game invitation to ${opponent.username} has expired.`
				})
				server.to(opponent.socketId).emit('invite', {
					message: `Invitation by ${challenger.username} has expired.`
				})
				challenger.invitePending = false
				opponent.isInvited = false
			}, 30000)
		}
	}

	async accept (message: any, chanService: ChanService, client: Socket, server: Server) {
		const msg = message.message.split(' ')
		if (msg.length != 1) {
			client.emit('serverResponse', {
				message: '/accept works with 1 argument: /accept'
			})
			return
		}
		const meOpponent = chanService.getRoom(message.room).getUser(message.sender)
		if (meOpponent === null || meOpponent.isInvited === false) {
			client.emit('serverResponse', {
				message: `You do not have a pending invite.`
			})
			return
		}
		// // // // console.log('salut 1')
		const challenger = chanService.getUserGn(message.opponentLogin)
		if (challenger && challenger.invitePending) {
			const id = parseInt(String(Math.floor(100000 + Math.random() * 900000)), 10);
			client.emit('gameStart', {
				message: `Game on.`,
				id: id,
				username: challenger.username
			})
			server.to(challenger.socketId).emit('gameStart', {
				message: `Game on.`,
				id: id,
				username: meOpponent.username
			})
			challenger.invitePending = false
			meOpponent.isInvited = false
			return
		}
	}
}
