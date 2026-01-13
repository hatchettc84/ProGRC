import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "src/auth/auth.service";
import { PermissionValidatorService } from "src/auth/permissionValidator.service";
import { RoleHierarchyService } from "src/auth/roleHierarchy.service";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private authSvc: AuthService,
        private reflector: Reflector,
        private readonly roleHierarchyService: RoleHierarchyService,
        private readonly permissionValidator: PermissionValidatorService ,
        private readonly logger: LoggerService
    ) { }

    async canActivate(context: ExecutionContext) {
        const allowedRoles = this.reflector.get<number[]>('allowedRoles', context.getHandler()) || [];
        const reqObj = context.switchToHttp().getRequest();
        const headers = reqObj.headers;
        const token = headers['Authorization'] || headers['authorization'];

        try {
            const result = await this.authSvc.verifyToken(token);
            await this.roleHierarchyService.verifyUserAccess({
                userId: result['userId'],
                customerId: result['customerId'],
                impersonateTimeExpiration: result['impersonateExpTime']
            }, allowedRoles);
            reqObj['user_data'] = result;
            const permitted = await this.permissionValidator.accessAllowed(reqObj);
            if (!permitted) {
                throw new ForbiddenException('Access Denied');
            }
            return true;
        } catch (error) {
            this.logger.info(error)
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new ForbiddenException(error);
        }

    }

}
