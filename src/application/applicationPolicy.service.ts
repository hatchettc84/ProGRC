import { ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AppUser, AppUserRole } from "src/entities/appUser.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { User } from "src/entities/user.entity";
import { UserRoles } from "src/masterData/userRoles.entity";
import { In, Repository } from "typeorm";
import * as metadata from "../common/metadata";

const userRoles = metadata["userRoles"];

@Injectable()
export class ApplicationPolicyService {
    constructor(
        @InjectRepository(AppUser) protected readonly appUserRepo: Repository<AppUser>,
        @InjectRepository(User) protected readonly userRepo: Repository<User>,
        @InjectRepository(AsyncTask) protected readonly asyncTaskRepo: Repository<AsyncTask>
    ) { }

    async canUpdateApplication(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
    }

    async canDeleteStandard(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canDeleteApplication(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canAddMember(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
    }

    async canUpdateMemberRole(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
    }

    async canRemoveMember(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
    }

    async canGetApplicationCompliance(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
    }

    async canUpdateTaskStatus(applicationId: number): Promise<boolean> {
        let isInFinalState: boolean = await this.ensureTaskNotHaveFinalState(applicationId);
        if(isInFinalState) {
            return false;
        }
        return true;
    }

    async canCreateApplication(userInfo: { userId: string, tenantId: string }): Promise<void> {
        const user = await this.userRepo.findOne({
            where: { id: userInfo.userId }
        });

        if (!user) {
            throw new ForbiddenException('User not found');
        }

        if (user.role_id !== userRoles.org_admin && user.role_id !== userRoles.org_member) {
            throw new ForbiddenException('User does not have permission to create applications');
        }
    }

    protected async ensureAdminPrivileges(appId: number, userId: string): Promise<void> {
        const user: User = await this.userRepo.findOne({
            where: { id: userId },
            select: ['role_id']
        });

        const hasInternalRole = UserRoles.getInternalRoles().includes(user.role_id);
        if (hasInternalRole) {
            return;
        }

        const isAdmin: boolean = await this.appUserRepo.createQueryBuilder('appUser')
            .innerJoin('appUser.app', 'app')
            .where('appUser.app_id = :appId', { appId })
            .andWhere('appUser.user_id = :userId', { userId })
            .andWhere('appUser.role IN (:...roles)', { roles: [AppUserRole.ADMIN, AppUserRole.AUDITOR] })
            .andWhere('app.deleted_at IS NULL') // Ensure app's deleted_at is checked
            .getCount() > 0;

        const result = await this.appUserRepo.query(`
            SELECT COUNT(*) as count FROM users u join app a on u.customer_id = a.customer_id where u.id = $1 and a.id = $2 and u.role_id = $3
        `, [userId, appId, userRoles.org_admin])

        const isOrgAdmin: boolean = parseInt(result[0].count) > 0;
        if (!isAdmin && !isOrgAdmin) {
            throw new ForbiddenException('You are not authorized to perform this action.');
        }
    }

    protected async ensureNotHavePendingTask(appId: number): Promise<void> {
        const pendingTask: AsyncTask = await this.asyncTaskRepo.findOne({
            select: ['id'],
            where: {
                app_id: appId,
                status: In(AsyncTask.pendingTaskStatus()),
            },
            order: {
                created_at: 'DESC',
            }
        });

        if (pendingTask) {
            throw new ConflictException('Operation restricted. Pending or processing async tasks must be completed before modifying the application.');
        }
    }

    protected async ensureNotHaveProcessedTask(appId: number): Promise<void> {
        const pendingTask: AsyncTask = await this.asyncTaskRepo.findOne({
            select: ['id'],
            where: {
                app_id: appId,
                status: In(AsyncTask.processedTaskStatus()),
            },
            order: {
                created_at: 'DESC',
            }
        });

        if (pendingTask) {
            throw new ConflictException('Operation restricted.  async task is already in processed state.');
        }
    }

    protected async ensureTaskNotHaveFinalState(appId: number): Promise<boolean> {
        const pendingTask: AsyncTask = await this.asyncTaskRepo.findOne({
            select: ['id'],
            where: {
                app_id: appId,
                status: In(AsyncTask.finalTaskStatus()),
            },
            order: {
                created_at: 'DESC',
            }
        });

        if (pendingTask) {
            return true;
        } else {
            return false;
        }
    }
}
