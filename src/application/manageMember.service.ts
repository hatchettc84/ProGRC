import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AppUser, AppUserRole } from "src/entities/appUser.entity";
import { User } from "src/entities/user.entity";
import { In, Repository } from "typeorm";
import { ApplicationPolicyService } from "./applicationPolicy.service";

interface AddMemberParams {
    userId: string;
    role: AppUserRole;
}

interface UserInfo {
    userId: string;
    tenantId: string;
}

export class ManageMemberService {
    constructor(
        @InjectRepository(AppUser) private readonly appUserRepo: Repository<AppUser>,
        @InjectRepository(User) private readonly orgMembersRepo: Repository<User>,
        private readonly ApplicationPolicyService: ApplicationPolicyService
    ) { }

    async addMember(
        userInfo: { userId: string, tenantId: string },
        applicationId: number,
        membersData: AddMemberParams[]
    ): Promise<AppUser[]> {
        await this.ApplicationPolicyService.canAddMember(userInfo, applicationId);

        const role_id = membersData[0].role === AppUserRole.AUDITOR ? 7 : userInfo['role_id'];
        const memberFound: number = await this.orgMembersRepo.countBy({
            ...(role_id !== 7 && { customer_id: userInfo.tenantId }),
            id: In(membersData.map(member => member.userId))
        });

        if (memberFound !== membersData.length) {
            throw new ForbiddenException('One or more members are not part of the organization.');
        }

        const newMembersData = membersData.map(member => ({
            app_id: applicationId,
            user_id: member.userId,
            role: member.role,
        }));

        const newMembers = this.appUserRepo.create(newMembersData);

        return await this.appUserRepo.save(newMembers);
    }

    async updateMemberRole(
        userInfo: { userId: string, tenantId: string },
        appId: number,
        userId: string,
        role: AppUserRole
    ): Promise<void> {
        await this.ApplicationPolicyService.canUpdateMemberRole(userInfo, appId);

        const result = await this.appUserRepo.update({
            app_id: appId,
            user_id: userId
        }, {
            role: role
        });

        if (result.affected === 0) throw new ForbiddenException('User not found in the application.');
    }

    async deleteMember(
        userInfo: UserInfo,
        appId: number,
        userId: string,
    ): Promise<void> {
        await this.validateDeletion(userInfo, appId, userId);
        await this.performDeletion(appId, userId);
    }

    private async validateDeletion(
        userInfo: UserInfo,
        appId: number,
        userId: string,
    ): Promise<void> {
        await this.ApplicationPolicyService.canRemoveMember(userInfo, appId);

        const role_id = userInfo['role_id'];

        if (this.isSelfDeletion(userInfo, userId)) {
            throw new BadRequestException('You cannot delete yourself.');
        }

        const memberCount = await this.getMemberCount(appId);
        if (role_id!= '7' && this.isLastMember(memberCount)) {
            throw new BadRequestException('Application must have at least one member.');
        }
    }

    private async performDeletion(appId: number, userId: string): Promise<void> {
        const result = await this.appUserRepo.delete({ app_id: appId, user_id: userId });

        if (result.affected === 0) {
            throw new BadRequestException('User not found in the application.');
        }
    }

    private isSelfDeletion(userInfo: UserInfo, userId: string): boolean {
        return userInfo.userId === userId;
    }

    private async getMemberCount(appId: number): Promise<number> {
        return this.appUserRepo.count({ where: { app_id: appId } });
    }

    private isLastMember(memberCount: number): boolean {
        return memberCount <= 1;
    }
}
