import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
 
@Injectable()
export class JwtAuthenticationGuard extends AuthGuard('jwt-access') {

}

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {}

@Injectable()
export class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {}