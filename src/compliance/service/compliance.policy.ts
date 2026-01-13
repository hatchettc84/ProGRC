import { Injectable } from "@nestjs/common";
import { ApplicationPolicyService } from "src/application/applicationPolicy.service";
import { AppUser } from "src/entities/appUser.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class CompliancePolicy extends ApplicationPolicyService {
    constructor(
        appUserRepo: Repository<AppUser>,
        userRepo: Repository<User>,
        taskRepo: Repository<AsyncTask>
    ) {
        super(appUserRepo, userRepo, taskRepo);
    }

    async canGetComplianceControlDetails(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
    }

    async canGetControlEnhancements(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
    }

    async canGetControlAssets(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
    }

    async canSetEvidence(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canSetEnhancementException(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canSyncCompliance(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canSetRiskLevel(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canSetRiskLevels(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canDownloadEvidence(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
    }

    async canDownloadCRMFile(userInfo: { userId: string }, applicationId: number, standardId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
    }

    async canDeleteCRMFile(userInfo: { userId: string }, applicationId: number, standardId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canUploadCRMFile(userInfo: { userId: string }, applicationId: number, standardId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
        await this.ensureNotHavePendingTask(applicationId);
    }
}
