import { InternalUserInviteEmail } from "src/notifications/templates/progrc-email";
import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CognitoService } from "src/auth/cognitoAuth.service";
import { DomainCacheService } from "src/cache/domain-cache.service";
import { Customer } from "src/entities/customer.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { InviteStatus, User } from "src/entities/user.entity";
import { UserRoles } from "src/masterData/userRoles.entity";
import { EmailService } from "src/notifications/email.service";
import { ResetPasswordTokenService, ResetPasswordTokenType } from "src/user/services/resetPasswordToken.service";
import { DataSource, EntityManager, Not, Repository } from "typeorm";
import { UpdateCustomerMemberRequest } from "../customer.dto";
import { v4 as uuidv4 } from 'uuid';
interface UpdateMemberData {
    name: string;
    email: string;
    mobile: string;
    roleId: number;
}

@Injectable()
export class UpdateMemberService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
        @InjectRepository(CustomerCsm) private readonly customerCsmRepo: Repository<CustomerCsm>,
        private readonly cognitoService: CognitoService,
        private readonly dataSource: DataSource,
        private readonly resetPasswordTokenSrvc: ResetPasswordTokenService,
        private readonly cacheService: DomainCacheService,
        private readonly emailService: EmailService,
    ) { }

    async updateCustomerMemberByAdmin(customerId: string, memberId: string, updateData: UpdateMemberData): Promise<void> {
        const user = await this.getUser(customerId, memberId);
        const updates = this.getUpdatedFields(user, updateData);

        await this.dataSource.transaction(async (manager) => {
            if (updates.needUpdateEmail) {
                await this.checkEmailUpdate(user, updates.updatedFields.email);
            }

            await this.applyUpdates(manager, user, updates.updatedFields);

            if (updates.needUpdateEmail) {
                await this.cognitoService.updateUserEmail(user.id, updates.updatedFields.email);
            }

            if (updates.needUpdateRoleId) {
                await this.cognitoService.updateUserRole(user.id, updates.updatedFields.role_id)
            }
        });
    }

    async createCustomerMemberByAdmin(customerId: string, updateData: UpdateCustomerMemberRequest, userInfo: any): Promise<void> {
        const customer = await this.customerRepo.findOne({ where: { id: customerId } });
        if (!customer) {
            throw new BadRequestException('Customer not found');
        }

        const customerCsm = await this.customerCsmRepo.findOne({ where: { customer_id: customerId, user_id: userInfo.userId } });
        if (!customerCsm) {
            throw new ForbiddenException('You are not authorized to create a member for this customer');
        }

        const existingUser = await this.userRepo.findOne({ where: { email: updateData.email } });
        if (existingUser) {
            throw new BadRequestException('Email already taken');
        }

        const roles: UserRoles[] = await this.cacheService.getUserRoles();
        if(!roles.some(role => role.id === updateData.roleId)) {
            throw new BadRequestException('Invalid role');
        }

        const user = new User();
        await this.dataSource.transaction(async (manager) => {

            user.id = uuidv4();
            user.email = updateData.email;
            user.name = updateData.name;
            user.mobile = updateData.mobile;
            user.role_id = updateData.roleId;
            user.customer_id = customerId;
            user.invite_status = InviteStatus.SENT;
            user.created_at = new Date();
            user.updated_at = new Date();
            await manager.save(User, user);
        });

        const actor: User = await this.userRepo.findOne({ select: ['name', 'id'], where: { id: userInfo.userId } });
        const resetPasswordToken: string = await this.resetPasswordTokenSrvc.createResetPasswordToken(actor.id, user.id, ResetPasswordTokenType.USER_INVITE);
        const emailBody: string = InternalUserInviteEmail({
            name: user.name,
            roleName: roles.find(role => role.id === updateData.roleId)?.role_name || '',
            inviterName: actor.name,
            inviteLink: `${process.env.FE_HOST}${process.env.USER_INVITATION_URL}?email=${encodeURIComponent(updateData.email)}&token=${encodeURIComponent(resetPasswordToken)}`,
        });

        this.emailService.sendEmail(updateData.email, [], 'ProGRC - Account Activated. Action Required!', emailBody);
    }

    async updateCustomerMemberByOrgAdmin(userInfo: { customerId: string }, memberId: string, updateData: UpdateMemberData): Promise<void> {
        await this.updateCustomerMemberByAdmin(userInfo.customerId, memberId, updateData);
    }

    private async getUser(customerId: string, memberId: string): Promise<User> {
        return this.userRepo.findOneOrFail({
            where: { id: memberId, customer_id: customerId },
        });
    }

    private getUpdatedFields(user: User, updateData: UpdateMemberData) {
        const updatedFields: Partial<User> = {};
        let needUpdateEmail = false;
        let needUpdateRoleId = false;
        let newEmail: string | undefined;

        if (user.email !== updateData.email) {
            newEmail = updateData.email.toLowerCase().trim();
            this.validateEmail(newEmail);
            updatedFields.email = newEmail;
            needUpdateEmail = true;
        }

        if (user.mobile !== updateData.mobile) {
            updatedFields.mobile = updateData.mobile;
        }

        if (user.name !== updateData.name) {
            updatedFields.name = updateData.name.trim();
        }

        if (user.role_id !== updateData.roleId) {
            this.validateCustomerRole(updateData.roleId);
            updatedFields.role_id = updateData.roleId;
            needUpdateRoleId = true
        }

        return { updatedFields, needUpdateEmail, needUpdateRoleId };
    }

    private async checkEmailUpdate(user: User, newEmail: string): Promise<void> {
        const existingUser = await this.userRepo.findOne({
            select: ['id'],
            where: { email: newEmail, id: Not(user.id) },
        });

        if (existingUser) {
            throw new BadRequestException('Email already taken');
        }
    }

    private async applyUpdates(manager: EntityManager, user: User, updatedFields: Partial<User>): Promise<void> {
        Object.assign(user, updatedFields);
        await manager.save(User, user);
    }

    private validateCustomerRole(roleId: number): void {
        if (!UserRoles.getCustomerRoles().includes(roleId)) {
            throw new BadRequestException('Invalid role');
        }
    }

    private validateEmail(email: string): void {
        const rfc5322Regex =
            /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/;
        if (!rfc5322Regex.test(email)) {
            throw new BadRequestException('Invalid email format');
        }
    }
}
