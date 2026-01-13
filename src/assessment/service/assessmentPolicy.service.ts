import { Injectable } from "@nestjs/common";
import { ApplicationPolicyService } from "src/application/applicationPolicy.service";
import { AppUser } from "src/entities/appUser.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class AssessmentPolicyService extends ApplicationPolicyService {
    constructor(
        appUserRepo: Repository<AppUser>,
        userRepo: Repository<User>,
        taskRepo: Repository<AsyncTask>
    ) {
        super(appUserRepo, userRepo, taskRepo);
    }

    async canCreateAssessment(userInfo: { userId: string }, applicationId: number) {
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canDeleteAssessment(userInfo: { userId: string }, applicationId: number) {
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canCreateOutline(userInfo: { userId: string }, applicationId: number) {
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canUpdateSection(userInfo: { userId: string }, applicationId: number) {
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canExportAssessment(userInfo: { userId: string }, applicationId: number) {
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canUpdateAssessment(userInfo: { userId: string }, applicationId: number) {
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canDownloadAssessment(userInfo: { userId: string }, applicationId: number) {
        await this.ensureNotHavePendingTask(applicationId);
    }
}
