import { HttpException, HttpStatus, Injectable, BadGatewayException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import PostgresErrorCode from '../database/postgresErrorCode.enum';
import { RegisterDto, RegisterAsGuestDTO} from './create-register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import TokenPayload2Auth from './tokenPayload2Auth.interface';
import TokenPayload from './tokenPayload.interface';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { User } from 'src/user/user.entity';
import { timeStamp } from 'console';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportSerializer } from '@nestjs/passport';



@Injectable()
export class AuthentificationService {
    constructor(
        private httpService: HttpService,
        private userService: UserService,
        private readonly jwtService: JwtService,
        private configService: ConfigService,

    ) {}

    public getCookiesForLogOut() {
        return [
          'Authentication=; Path=/; Max-Age=0; SameSite=Strict;',
          'Refresh=; HttpOnly; Path=/auth/refresh; Max-Age=0; SameSite=Strict;'
        ];
      }

    async register42(code: string, state: string) {
        
        const token = await this.getToken42(code, state);
        const user: Partial<User> = await this.getUser42(token);
        return this.putUser42(user);
    }

    async getUser42(token: string) {
        const getInfo: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: ` Bearer ${token}`,
            },
        };
        return await lastValueFrom(
            this.httpService
              .get('https://api.intra.42.fr/v2/me', getInfo)
              .pipe(
                map((resp) => {
                  return {
                    login42: resp.data.login,
                    avatar42: resp.data.image_url,
                  };
                }),
              ),
          ).catch((err) => {
            throw new BadGatewayException(err.message);
          });
    }

    async getToken42(code: string, state: string): Promise<string> {
        const dataPost: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.CLIEND_ID_42,
                client_secret: process.env.CLIENT_SECRET_42,
                code: code,
                redirect_uri: process.env.CLIENT_REDIRECT_42,
                state: state,
            },
        };

        return await lastValueFrom(
            this.httpService
            .post('https://api.intra.42.fr/oauth/token', null, dataPost)
            .pipe(
                map((resp) => {
                    return resp.data.access_token;
                }),
            ),
        ).catch((err) => {
            throw new BadGatewayException(err.message);
        });
    }

    async putUser42(user: Partial<User>) {

        const findUser = await this.userService.getLogin42(user.login42);
        if (!findUser)
        {
            // // // // console.log('user = ', user);
            user.username = user.login42;
            const createdUser = await this.userService.create42(user);
            return createdUser;
        }
        return findUser;
    }

    public async registerAsGuest(registrationData: RegisterAsGuestDTO) {

        try {
            const user: Partial<User> = {
                login42: registrationData.login42,
                avatar42: registrationData.avatar42,
                username: registrationData.login42,
            }
            const createdUser = await this.userService.create42(user);
            return createdUser;
        } catch (error) {
            throw new HttpException('Impossible to create user\ guest', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public async getAuthentificationUser(login42: string, avatar42: string) {
        try {
            const user = await this.userService.findUserByLogin(login42);
            let truc = avatar42;
            return (user);
        } catch (error) { 
            throw new HttpException('Wrong credentials provided password 2 email', HttpStatus.BAD_REQUEST);
        }
    }

    private async verifyPassword(plainTextPassword: string, hasedPassword: string) {
        const isPasswordMatching = await bcrypt.compare(
            plainTextPassword,
            hasedPassword
        )
        if (!isPasswordMatching) {
            throw new HttpException('Wrong credentials prividaed password', HttpStatus.BAD_REQUEST);
        }
    }

    public getCookieWithJwtToken(userId: string, isSecondFactorAuthenticated = false,) {

        const payload: TokenPayload = { userId, isSecondFactorAuthenticated };
        const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: `${this.configService.get('JWT_EXPIRATION_TIME')}s`,
        });
        return `Authentication=${token}; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}; SameSite=Strict;`;
    }
\
    public getCookieWithJwtRefreshToken(userId: string) {

        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
        });
        const cookie = `Refresh=${token}; Path=/auth/refresh; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME',)}; SameSite=Strict;`;
        return { cookie, token };
    }
}

export type Done = (err: Error, user: User) => void;

@Injectable()
export class SessionSerializer extends PassportSerializer {
constructor(

    private readonly userService: UserService,
) {
    super();
}

serializeUser(user: User, done: Done) {
    done(null, user);
}

async deserializeUser(user: User, done: Done) {
    const userDB = await this.userService.findUserByLogin(user.id);
    return userDB ? done(null, userDB) : done(null, null);
}
}