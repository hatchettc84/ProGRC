import { ResetUserPasswordEmail } from "src/notifications/templates/progrc-email";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "src/entities/customer.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { InviteStatus, User } from "src/entities/user.entity";
import { UserRole } from "src/masterData/userRoles.entity";
import { EmailService } from "src/notifications/email.service";
import { ResetPasswordTokenService, ResetPasswordTokenType } from "src/user/services/resetPasswordToken.service";
import { Repository } from "typeorm";

@Injectable()
export class ResetPasswordService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(CustomerCsm) private readonly customerCsmRepository: Repository<CustomerCsm>,
        @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        private readonly resetPasswordTokenSrvc: ResetPasswordTokenService
    ) { }

    async resetPasswordUser(userInfo: { userId: string }, userData: { userId: string, customerId: string }): Promise<void> {
        const loggedInUser = await this.userRepository.findOne({
            where: {
                id: userInfo.userId,
            },
            select: ['id', 'email', 'role_id', 'customer_id']
        })
        const user: User = await this.userRepository.findOneOrFail({
            where: {
                id: userData.userId,
                customer_id: userData.customerId
            },
            select: ['id', 'email', 'name']
        })

        if (Number(loggedInUser.role_id) !== Number(UserRole.SuperAdmin) && Number(loggedInUser.role_id) === Number(UserRole.CSM)) {
            const csmCustomerMapping = await this.customerCsmRepository.findOne({
                where: {
                    user_id: loggedInUser.id,
                    customer_id: userData.customerId
                }
            });

            if (!csmCustomerMapping) {
                throw new ForbiddenException('Access Denied! You do not have permission to reset password for this user. Please contact support.');
            }
        } else if (Number(loggedInUser.role_id) !== Number(UserRole.SuperAdmin) && Number(loggedInUser.role_id) === Number(UserRole.OrgAdmin)) {
            if (loggedInUser.customer_id !== userData.customerId) {
                throw new ForbiddenException('Access Denied! You do not have permission to reset password for this user. Please contact support.');
            }
        } else if (Number(loggedInUser.role_id) !== Number(UserRole.SuperAdmin) && loggedInUser.id !== userData.userId) {
            throw new ForbiddenException('Access Denied! You do not have permission to reset password for this user. Please contact support.');
        }

        const resetPasswordToken: string = await this.resetPasswordTokenSrvc.createResetPasswordToken(userInfo.userId, user.id, ResetPasswordTokenType.RESET_PASSWORD);
        const resetPasswordLink = this.generateResetPasswordLink(user.email, resetPasswordToken);
        const emailHtml = await this.renderResetPasswordEmail(user.name, resetPasswordLink);

        user.invite_status = InviteStatus.RESET_PASSWORD;
        await this.userRepository.save(user);
        await this.emailService.sendEmail(
            user.email,
            [],
            'Reset Password',
            emailHtml
        );
    }

    private generateResetPasswordLink(email: string, token: string): string {
        const feHost = this.configService.get<string>('FE_HOST');
        const resetPasswordUrl = this.configService.get<string>('RESET_PASSWORD_URL');
        return `${feHost}${resetPasswordUrl}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
    }

    private async renderResetPasswordEmail(name: string, resetPasswordLink: string): Promise<string> {
        const expiryTime = `${this.configService.get<string>('RESET_PASSWORD_EXPIRY_TOKEN_HOUR')} hours`;
        return ResetUserPasswordEmail({
            name,
            resetPasswordLink,
            expiryTime,
        });
    }
}
