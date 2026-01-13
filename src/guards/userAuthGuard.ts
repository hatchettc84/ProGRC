import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class UserAuthGuard implements CanActivate {
    constructor(private authSvc: AuthService, private reflector: Reflector) { }

    async canActivate(context: ExecutionContext) {
        const allowedRoles = this.reflector.get<number[]>('allowedRoles', context.getHandler());
        const reqObj = context.switchToHttp().getRequest();
        const headers = reqObj.headers;
        // const token = headers['Authorization'] || headers['authorization'];
        const email = headers['email'];
        try {
            const result = await this.authSvc.verifyUserAccess(email, allowedRoles);
            reqObj['user_data'] = result;
            return true;
        } catch (error) {
            throw new ForbiddenException('Access Denied!');
        }

    }
}