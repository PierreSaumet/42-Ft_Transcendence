import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity'
import { UsersModule } from './user/user.module';
import { AuthentificationModule } from './authentification/authentification.module';
import * as Joi from 'joi';
import { ChatModule } from './chat/chat.module';
import { JwtRefreshTokenStrategy, JwtTwoFactorStrategy } from './authentification/jwt.strategy'

import { ScheduleModule } from '@nestjs/schedule';
import { GameGateway} from './game/game.gateway';
import { GameModule } from './game/game.module';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        TWO_FACTOR_AUTHENTICATION_APP_NAME: Joi.string().required(),
      }),
      isGlobal: true, 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: +configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [User],
        synchronize: true, // For production should be false
        autoLoadEntities: true,
        // dropSchema: true, //  don't use in production
      }),
      inject: [ConfigService],
    }), 
    UsersModule,
    AuthentificationModule,
    ChatModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtRefreshTokenStrategy, JwtTwoFactorStrategy, GameGateway],
})
export class AppModule {}
