import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthentificationService } from './authentification.service';
import { User } from '../user/user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
 
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthentificationService) {
    super({
      usernameField: 'login42',
      passwordField: 'avatar42',
    });
  }
  async validate(login42: string, avatar42: string): Promise<User> {
    const user = await this.authenticationService.getAuthentificationUser(login42, avatar42);
    if (!user)
     throw new UnauthorizedException();
    return user;
  }

}