import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import LocalFile from './localFiles.entity';
import LocalFilesService from './localFiles.service';
import LocalFilesController from './localFiles.controller';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UsersModule } from '../user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocalFile]),
    ConfigModule,
  ],
  providers: [LocalFilesService],
  exports: [LocalFilesService],
  controllers: [LocalFilesController]
})
export class LocalFilesModule {}