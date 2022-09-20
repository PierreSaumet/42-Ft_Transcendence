import { ChatCommandsHandler } from "./chat.commandFn"
import { Inject, Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io'

import { ChanService } from "./chan.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class ChatService {

  constructor(private chanService: ChanService, private chatCommandsHandler: ChatCommandsHandler) {
    chanService.chatService = this
  }

	async execute(message: any, server: Server, client: Socket) {
    const commands = {
      "/create": this.chatCommandsHandler.create,
      "/delete": this.chatCommandsHandler.delete,
      "/join": this.chatCommandsHandler.join,
      "/pm": this.chatCommandsHandler.pm,
      "/help": this.chatCommandsHandler.help,
      "/mute": this.chatCommandsHandler.mute,
      "/unmute": this.chatCommandsHandler.unmute,
      "/ban": this.chatCommandsHandler.ban,
      "/unban": this.chatCommandsHandler.unban,
      "/blockusr": this.chatCommandsHandler.blockusr,
      "/unblock": this.chatCommandsHandler.unblock,
      "/pw": this.chatCommandsHandler.pw,
      "/unpw": this.chatCommandsHandler.unpw,
      "/printUsers": this.chatCommandsHandler.printUsers,
      "/printChannels": this.chatCommandsHandler.printChannels,
      "/leave": this.chatCommandsHandler.leave,
      "/profile": this.chatCommandsHandler.profile,
      "/invite": this.chatCommandsHandler.invite,
      "/accept": this.chatCommandsHandler.accept,
      "/kick": this.chatCommandsHandler.kick,
      "/admin": this.chatCommandsHandler.admin,
    }

    const msg = message.message.split(' ')
    if (msg[0] in commands) {
      if (msg[0] === '/pm' || msg[0] === '/delete' || msg[0] === '/ban' || msg[0] === '/invite' || msg[0] === '/accept' || msg[0] === '/kick') {
        await commands[msg[0]](message, this.chanService, client, server)
      } else {
        await commands[msg[0]](message, this.chanService, client)
      }
    } else {
      client.emit('serverResponse', {
        message: 'Your command failed. Please type /help if you want to learn about the available commands'
      }) 
    }
  }
}