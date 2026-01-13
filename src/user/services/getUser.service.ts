import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { UserRole, UserRoles } from "src/masterData/userRoles.entity";
import { In, Not, Repository } from "typeorm";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
export class GetUserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly logger: LoggerService,
    ) { }

    async getUsers(userInfo: { roleId: number, email: string }, limit: number, offset: number): Promise<[User[], number]> {
        // right now super admin don't have any role_id in cognito
        const roleCondition = userInfo.roleId === UserRole.CSM
            ? { role_id: UserRole.CSM }
            : { role_id: In(UserRoles.getInternalRoles()) };

        // For super admins, include all internal users (including themselves)
        // For CSMs, exclude themselves from the list
        const whereCondition = userInfo.roleId === UserRole.SuperAdmin || userInfo.roleId === UserRole.SuperAdminReadOnly
            ? [roleCondition] // Include all internal users, including the admin themselves
            : [
                {
                    ...roleCondition,
                    email: Not(userInfo.email),
                }
            ];

        // Debug logging
        this.logger.log(`[GetUserService] Fetching users`, {
            requestingRoleId: userInfo.roleId,
            requestingEmail: userInfo.email,
            whereCondition: whereCondition,
            limit,
            offset,
            internalRoles: UserRoles.getInternalRoles()
        });

        const [users, total] = await this.userRepository.findAndCount({
            where: whereCondition,
            skip: offset,
            take: limit,
            relations: ["role"],
            order: { created_at: 'DESC' }, // Order by creation date, newest first
        });

        // Debug logging
        this.logger.log(`[GetUserService] Found ${users.length} users (total: ${total})`, {
            users: users.map(u => ({ id: u.id, email: u.email, role_id: u.role_id, role_name: u.role?.role_name }))
        });

        return [users, total];
    }

    async getAuditor(userInfo: { roleId: number, email: string }, limit: number, offset: number): Promise<[User[], number]> {
        return await this.userRepository.findAndCount({
            where: {
                role_id: UserRole.AUDITOR,
            },
            skip: offset,
            take: limit,
            relations: ["role"],
        });
    }
}
