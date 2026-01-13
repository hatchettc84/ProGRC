import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { User } from "src/entities/user.entity";
import { UserRole } from "src/masterData/userRoles.entity";
import { Repository } from "typeorm";
import { CognitoService } from "./cognitoAuth.service";
import { LoggerService } from "src/logger/logger.service";

interface UserInfo {
    userId: string;
    customerId: string;
    impersonateTimeExpiration: string;
}

@Injectable()
export class RoleHierarchyService {
    private readonly roleHierarchy = {
        [UserRole.SuperAdmin]: [UserRole.SuperAdmin, UserRole.CSM, UserRole.SuperAdminReadOnly, UserRole.OrgAdmin, UserRole.OrgMember],
        [UserRole.CSM]: [UserRole.CSM, UserRole.SuperAdminReadOnly, UserRole.OrgAdmin, UserRole.OrgMember],
        [UserRole.SuperAdminReadOnly]: [UserRole.SuperAdminReadOnly, UserRole.OrgAdmin, UserRole.OrgMember],
        [UserRole.OrgAdmin]: [UserRole.OrgAdmin, UserRole.OrgMember],
        [UserRole.CSM_AUDITOR]: [UserRole.CSM_AUDITOR, UserRole.AUDITOR],
        [UserRole.OrgMember]: [UserRole.OrgMember],
        [UserRole.AUDITOR]: [UserRole.AUDITOR],
    };

    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(CustomerCsm) private readonly customerCsmRepository: Repository<CustomerCsm>,
        private readonly cognitoService: CognitoService,
        private readonly logger: LoggerService
    ) { }

    // modify from src/auth/auth.service.ts#verifyUserAccess
    async verifyUserAccess(userInfo: UserInfo, allowedRoles: number[]): Promise<void> {
        const user = await this.getUserById(userInfo.userId);

        if (this.isCSMImpersonatingOrgAdmin(user.role_id, allowedRoles)) {
            await this.verifyCsmCustomerMapping(userInfo.userId, userInfo.customerId);
            this.verifyExpirationImperonateToken(userInfo.impersonateTimeExpiration, userInfo.userId);
        }

        if (!this.hasUserAccess(user.role_id, allowedRoles)) {
            throw new ForbiddenException('Access Denied! You do not have permission to access this API. Please contact support.');
        }
    }

    private async getUserById(userId: string): Promise<User> {
        const user: User = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            this.logger.info('Invalid user', userId);
            throw new ForbiddenException('Invalid user');
        }
        return user
    }


    private isCSMImpersonatingOrgAdmin(roleId: number, allowedRoles: number[]): boolean {
        return roleId === UserRole.CSM && !allowedRoles.includes(UserRole.CSM) && allowedRoles.includes(UserRole.OrgAdmin);
    }

    private async verifyCsmCustomerMapping(userId: string, customerId: string): Promise<void> {
        if (!customerId) {
            throw new ForbiddenException('Only assigned CSM can impersonate customer');
        }

        const assignedCsm = await this.customerCsmRepository.findOne({
            where: { user_id: userId, customer_id: customerId, role_id: UserRole.CSM }
        });

        if (!assignedCsm) {
            throw new ForbiddenException('Only assigned CSM can impersonate customer');
        }
    }

    private hasUserAccess(userRole: number, allowedRoles: number[]): boolean {
        const hierarchyRoles = this.roleHierarchy[userRole] ?? [];
        return allowedRoles.length == 0 ? true : allowedRoles.includes(userRole) || hierarchyRoles.some(role => allowedRoles.includes(role));
    }

    private verifyExpirationImperonateToken(expirationTime: string, userId: string): void {
        if (!expirationTime) {
            throw new ForbiddenException('Impersonate token has expired');
        }

        // 2024-11-19T07:38:56.728Z time format
        const tokenExpiration = new Date(expirationTime);
        if (isNaN(tokenExpiration.getTime())) {
            throw new ForbiddenException('Invalid impersonate token expiration time');
        }

        const currentTime = new Date();
        if (tokenExpiration < currentTime) {
            this.cognitoService.removeImpersonation(userId);
            throw new UnauthorizedException('Impersonate token has expired');
        }
    }
}
