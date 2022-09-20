import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
 
@Injectable()
export class LocalAuthenticationGuard extends AuthGuard('local') {

}

@Injectable()
export class AuthenticateGuard implements CanActivate {

    async canActivate( context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        return request.isAuthenticated();
    }
}

    