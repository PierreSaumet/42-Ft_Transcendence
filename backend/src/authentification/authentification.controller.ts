import { BadGatewayException, Injectable, Get, Body, Req, Controller, HttpCode, Post, UseGuards, Res, UseInterceptors, ExecutionContext, Query, Redirect, BadRequestException, Logger, Param } from '@nestjs/common';
import { AuthentificationService } from './authentification.service';
import { LocalAuthenticationGuard } from './localAuthentification.guard';
import RequestWithUser  from './requestWithUser.interface'
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthenticationGuard, JwtRefreshGuard } from 'src/authentification/jwt-authentification.guard';
import { Status } from 'src/global/global.enum';
import {RegisterAsGuestDTO, RegisterDto} from './create-register.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';

@Controller('authentification')
export class AuthentificationController {
    constructor(
        private readonly authentificationService: AuthentificationService,
        private readonly userService: UserService
    ) {}


    @Get('test')
    @Redirect()
    async connection42(@Res() res: Response, @Query() query: {code: string; state: string}, @Req() req: RequestWithUser) {
  
        if (query.state != "01234567899876543210") {
            throw new BadRequestException('Error code state.');
        }
        const user42 = await this.authentificationService.register42(query.code, query.state).catch((e) => {
            new Logger('AuthCallBack').debug(e);
        });
        if (!user42) {
            throw new BadGatewayException('Cannot connect a user with 42 API');
        }
        const accessTokenCookie = this.authentificationService.getCookieWithJwtToken( user42.id,  );
        const refreshToken = this.authentificationService.getCookieWithJwtRefreshToken(user42.id);
        await this.userService.setCurrentRefreshToken(refreshToken.token, user42.id);
        if (user42.isTwoFactorAuthentificationEnabled) {
            const twofaToken = this.authentificationService.getCookieWithJwtToken( user42.id,  );
            res.setHeader('Set-Cookie', [twofaToken, accessTokenCookie, refreshToken.cookie]);
        }
        else
            res.setHeader('Set-Cookie', [accessTokenCookie, refreshToken.cookie]);
        this.userService.putOnline(user42.id);
        return { url: 'http://localhost:8080/' };
    }
    
    @Post('registerguest')
    @UseInterceptors(FileInterceptor('files'))
    async registerAsGuest(@Body() reg: RegisterAsGuestDTO, files: Array<Express.Multer.File>) {
                
        return this.authentificationService.registerAsGuest(reg);
    }

    @HttpCode(200)
    @UseGuards(LocalAuthenticationGuard)
    @Post('login')
    async loginguest(@Req() req: RequestWithUser, @Res() response: Response) {

        const { user } = req;
        const accessTokenCookie = this.authentificationService.getCookieWithJwtToken( user.id, );
        const refreshToken = this.authentificationService.getCookieWithJwtRefreshToken(user.id);
       await this.userService.setCurrentRefreshToken(refreshToken.token, user.id);
        response.setHeader('Set-Cookie', [accessTokenCookie, refreshToken.cookie]);

        this.userService.putOnline(user.id);
        const user_return = await this.userService.getById(user.id);
        return response.send(user);
    }

    @HttpCode(200)
    @UseGuards(LocalAuthenticationGuard)
    @Post('log-in')
    async login(@Req() request: RequestWithUser, @Res() response: Response) {
        
        const {user} = request;
        const cookie = this.authentificationService.getCookieWithJwtToken(user.id, );
        response.setHeader('Set-Cookie', cookie);
        user.status = Status.ONLINE;
        return response.send(user);
    }

    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    refresh(@Req() request: RequestWithUser, @Res() res) {
        const accessTokenCookie = this.authentificationService.getCookieWithJwtToken(request.user.id, );
 
        res.setHeader('Set-Cookie', accessTokenCookie);
        const { login42, avatar42 } = request.user;
        return res.send({ login42, avatar42 });
     }

    @UseGuards(JwtAuthenticationGuard)
    @Post('logout')
    async logOut(@Req() request: RequestWithUser) {
        
        await this.userService.removeRefreshToken(request.user.id);
        request.res.setHeader('Set-Cookie', this.authentificationService.getCookiesForLogOut());
        this.userService.putOffline(request.user.id);
      }

    @UseGuards(JwtAuthenticationGuard)
    @Get('status')
    userStatus(@Req() request: RequestWithUser) {
        const user : User = request.user;
        return user;
    }
    
}
