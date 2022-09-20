import { Inject, Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from 'src/user/user.service';

import { ChanService } from './chan.service';
import { ChatService } from './chat.service';
import { Room } from './room.service'

@WebSocketGateway(8081, { cors: true, namespace: '/chat' })
export class ChatGateway implements OnGatewayInit {

  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService, private chanSevice: ChanService, private readonly userService: UserService) {}

  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: any) {
    this.logger.log('Initialized');
  }

  @SubscribeMessage('chatToServer')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() message: {sender: string, username: string, room: string, message: string}) {
    if (this.chanSevice.getRoom(message.room).getUser(message.sender).username !== message.username) {
      this.chanSevice.getRoom(message.room).getUser(message.sender).changeUsername(message.username)
    }
    if (message.message.startsWith('/')) {
      this.chatService.execute(message, this.server, client);
      this.server.to(message.room).emit('commandResponse', message);
    } else {
      const currRoom = this.chanSevice.getRoom(message.room)
      const usrBlk = this.chanSevice.getUsersBlocked(message.sender)
      // // // // // console.log('current room: ', currRoom)
      if (currRoom.isMuted(message.sender))
        return
      for (let [usr, data] of currRoom.users) {
        if (data.ban.includes(message.sender) ) {
          // // // // console.log('user is blocked 1')
          continue
        }
          
        if (usrBlk && usrBlk.includes(usr)) {
          // // // // console.log('user is blocked 2')
          continue
        }
        this.server.to(data.socketId).emit('chatToClient', message)
      }
    }
  }


  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: {room: string, login: string, username: string}) {
    client.join(data.room);
    if (!(this.chanSevice.roomExists(data.room))) {
      const chan = new Room(data.room, data.login, data.username, client.id);
      this.chanSevice.addRoom(chan);
    } else if (this.chanSevice.getRoom(data.room).userExists(data.login)) {
      this.chanSevice.getRoom(data.room).getUser(data.login).socketId = client.id;
    } else {
      this.chanSevice.getRoom(data.room).addUser(data.login, data.username, client.id);
    }
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(client: Socket) {

    let test = this.chanSevice.getUserBySocketId(client.id)
    if (test) {
      this.chanSevice.removeUserGn(this.chanSevice.getUserLoginBySocketId(client.id))
    }

    await this.userService.socketOffline(test);

    this.logger.log('Disconnected');
    client.disconnect()
  }
  
  @SubscribeMessage('decoN')
  decoN(client: Socket, data: {room: string, gRoom: string}) {
    client.leave(data.room);
    client.join('general')
  }

  // @SubscribeMessage('acceptInvite')
  // acceptInvite(client: Socket, data: {room: string, login: string, username: string}) {
  // }
}
