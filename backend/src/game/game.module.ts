import { Module } from '@nestjs/common';
import { UsersModule } from 'src/user/user.module';
import { GameGateway } from './game.gateway';
import { GameData, GameManager } from './game.model';

@Module({})
export class GameModule {}