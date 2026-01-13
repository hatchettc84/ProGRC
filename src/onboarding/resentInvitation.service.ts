import { NewAdminInviteEmail } from "src/notifications/templates/progrc-email";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "src/entities/customer.entity";
import { InviteStatus, User } from "src/entities/user.entity";
import { EmailService } from "src/notifications/email.service";
import { ResetPasswordTokenService, ResetPasswordTokenType } from "src/user/services/resetPasswordToken.service";
import { Repository } from "typeorm";

@Injectable()
export class ResendInvitationService {
    constructor(
        @InjectRepository(Customer) private customerRepository: Repository<Customer>,
        @InjectRepository(User) private userRepository: Repository<User>,
        private readonly emailService: EmailService,
        private readonly resetPasswordTokenSrvc: ResetPasswordTokenService,
        private readonly config: ConfigService,
    ) { }

    async resendInvitationForEmail(userInfo: { userId: string, customerId: string }, email: string): Promise<void> {
        const customer: Customer = await this.customerRepository.findOneOrFail({ where: { id: userInfo.customerId } });
        const user: User = await this.userRepository.findOneOrFail({ where: { email: email, customer_id: userInfo.customerId } });

        if ([InviteStatus.NOT_NEEDED, InviteStatus.JOINED].includes(user.invite_status)) {
            throw new BadRequestException('Can not re-send invite to this user. This user has already joined.');
        }

        const actor: User = await this.userRepository.findOneOrFail({ select: ['name', 'id'], where: { id: userInfo.userId } });
        const resetPasswordToken: string = await this.resetPasswordTokenSrvc.createResetPasswordToken(actor.id, user.id, ResetPasswordTokenType.USER_INVITE);
        const emailBody: string = NewAdminInviteEmail({
            adminName: user.name,
            orgName: customer.organization_name,
            inviterName: actor.name,
            inviteLink: `${this.config.get<string>('FE_HOST')}${this.config.get<string>('USER_INVITATION_URL')}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetPasswordToken)}`,
        });

        await this.emailService.sendEmail(
            email,
            [],
            `ProGRC - You're invited to join ${customer.organization_name}`,
            emailBody
        );
    }
}
