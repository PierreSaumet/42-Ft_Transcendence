import { Controller, Get, Post, Delete, Param, Body, Inject, ValidationPipe, ParseUUIDPipe, UseInterceptors, UploadedFile, HttpException, HttpStatus, Req, UseGuards, Put } from '@nestjs/common';
import { MatchHistoryDTO, ChangeUsernameDTO, AddorRemoveFriendDTO, CodeDTO } from './create-user.dto';
import { UserService } from './user.service';
import { User } from './user.entity'
import 'multer';
import { extname } from 'path';
import LocalFilesInterceptor from './localFiles/localFiles.interceptor';
import { JwtAuthenticationGuard } from 'src/authentification/jwt-authentification.guard';
import RequestWithUser  from 'src/authentification/requestWithUser.interface'

@Controller('user')
export class UserController {

    @Inject(UserService)
    public readonly userService: UserService;


    //////////////////////// GET /////////////////////////

    @Get('/avatarId/:id')
    @UseGuards(JwtAuthenticationGuard)
    getAvatarId(@Param('id', ParseUUIDPipe) id: string) {
        return this.userService.getAvatarId(id);
    }

    @Get('status/:username')
    @UseGuards(JwtAuthenticationGuard)
    getStatusUsername(@Param('username', ValidationPipe) name: string) {
        return this.userService.getStatusUsername(name);
    }


    //////////////////////// POST /////////////////////////
    @Post('/uploadAvatar/:id')
    @UseGuards(JwtAuthenticationGuard)
    @UseInterceptors(LocalFilesInterceptor({
        fieldName: 'file',
        path: '/avatars',
        fileFilter: (req: any, file: any, cb: any) => {
            if (file.mimetype.includes('image'))
                cb(null, true);
            else
                cb( new HttpException(`Unsupported file type Ahahah ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
        },
        limits: {
            fileSize: Math.pow(1024, 2) // 1MB
        }
    }))
    async uploadFile(@Param('id', ParseUUIDPipe) id: string, @UploadedFile() file) {
        
        if (id)
        {
            if (file)
            {
                return this.userService.addAvatar(id, {
                    path: file.path,
                    filename: file.originalname,
                    mimetype: file.mimetype,
                });
            }
        }
    }

    @Post('/matchHistory')
    @UseGuards(JwtAuthenticationGuard)
    async updateHistory(@Req() request: RequestWithUser, @Body() body: MatchHistoryDTO) {
        
        return this.userService.updateHistory(request.user.id, body);
    }

    @Post('/addfriend')
    @UseGuards(JwtAuthenticationGuard)
    addFriend(@Req() request: RequestWithUser, @Body() body: AddorRemoveFriendDTO) {

        return this.userService.addFriend(request.user.id, body.username);
    }

    @Post('/changeUserName')
    @UseGuards(JwtAuthenticationGuard)
    changeUsername(@Body() body: ChangeUsernameDTO) {

        return this.userService.changeUsername(body.id, body.username);
    }

    //////////////////////// PUT /////////////////////////
    @Put('/offline')
    @UseGuards(JwtAuthenticationGuard)
    async putOfflin(@Req() request: RequestWithUser) {

        return this.userService.putOffline(request.user.id);
    }



    @Put('/online')
    @UseGuards(JwtAuthenticationGuard)
    async putOnline(@Req() request: RequestWithUser) {

        return this.userService.putOnline(request.user.id);
    }

    @Put('/putIngame')
    @UseGuards(JwtAuthenticationGuard)
    async putIngame(@Req() request: RequestWithUser) {

        return this.userService.putIngame(request.user.id);
    }

    @Put('/putVictory')
    @UseGuards(JwtAuthenticationGuard)
    async putVictory(@Req() request: RequestWithUser) {

        return this.userService.putVictory(request.user.id);
    }

    @Put('/putLoose')
    @UseGuards(JwtAuthenticationGuard)
    async putLoose(@Req() request: RequestWithUser) {

        return this.userService.putLoose(request.user.id);
    }

    //////////////////////// DELETE /////////////////////////
    @Delete(':id')
    removeUser(@Param('id', ParseUUIDPipe) id: string) {

        return this.userService.removeUser(id);
    }


}

