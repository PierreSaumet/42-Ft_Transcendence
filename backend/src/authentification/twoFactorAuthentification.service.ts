import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { toFileStream }  from 'qrcode';

@Injectable()
export class TwoFactorAuthentificationService {

    constructor (
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {}
   
    public async generateTwoFactorAuthentification(id: string) {

        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(id, this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
        await this.userService.setTwoFactorAuthenticationSecret(secret, id);
        return {
            secret,
            otpauthUrl
        }
    }

    public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
        return toFileStream(stream.setHeader('Content-Type', 'image/png'), otpauthUrl);
    }

    public isTwoFactorCodeValid(twoFactorCode: string, user: User) {
        try {
            const isValid = authenticator.verify({
                token: twoFactorCode,
                secret: user.twoFactorAuthenticationSecret
            });
            return isValid;
        } catch (err) {
            return null;
        }
        
    }


}