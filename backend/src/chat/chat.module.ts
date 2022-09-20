import { ChatCommandsHandler } from './chat.commandFn';
import { ChatGateway } from './chat.gateway';
import { Module } from '@nestjs/common';
import { ChanService } from './chan.service';
import { ChatService } from './chat.service';
import { Room } from './room.service';
import { UsersModule } from 'src/user/user.module';
// import { UserService } from 'src/user/user.service';

@Module({
	imports: [UsersModule],
	controllers: [],
	providers: [ChatGateway, ChatService, ChatCommandsHandler, ChanService, Room],
})
export class ChatModule { }