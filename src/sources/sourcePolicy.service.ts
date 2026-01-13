import { Injectable } from "@nestjs/common";
import { ApplicationPolicyService } from "src/application/applicationPolicy.service";
import { AppUser } from "src/entities/appUser.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class SourcePolicyService extends ApplicationPolicyService {
    constructor(
        appUserRepo: Repository<AppUser>,
        userRepo: Repository<User>,
        taskRepo: Repository<AsyncTask>
    ) {
        super(appUserRepo, userRepo, taskRepo);
    }

    async canUploadSource(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
        await this.ensureNotHavePendingTask(applicationId);
    }

    async canDeleteSource(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
        await this.ensureNotHaveProcessedTask(applicationId);
    }

    async canDownloadSource(userInfo: { userId: string }, applicationId: number) {
        await this.ensureAdminPrivileges(applicationId, userInfo.userId);
    }
}
