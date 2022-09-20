import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { LocalFilesModule } from './localFiles/localFiles.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), LocalFilesModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UsersModule {}
