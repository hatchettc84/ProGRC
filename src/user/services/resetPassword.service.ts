import { ResetUserPasswordEmail } from "src/notifications/templates/progrc-email"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "src/entities/user.entity"
import { UserRoles } from "src/masterData/userRoles.entity"
import { EmailService } from "src/notifications/email.service"
import { In, Repository } from "typeorm"
import { ResetPasswordTokenService, ResetPasswordTokenType } from "./resetPasswordToken.service"

export class ResetInternalUserPassword {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        private readonly resetPasswordTokenSrvc: ResetPasswordTokenService
    ) { }

    async resetPasswordUser(userInfo: { userId: string }, userId: string): Promise<void> {
        const user = await this.userRepository.findOneOrFail({
            where: {
            id: userId,
            }
        })

        const resetPasswordToken: string = await this.resetPasswordTokenSrvc.createResetPasswordToken(userInfo.userId, user.id, ResetPasswordTokenType.RESET_PASSWORD);
        const resetPasswordLink = this.generateResetPasswordLink(user.email, resetPasswordToken);
        const emailHtml = await this.renderResetPasswordEmail(user.name, resetPasswordLink);

        await this.emailService.sendEmail(
            user.email,
            [],
            'Reset Password',
            emailHtml
        );
    }

    private generateResetPasswordLink(email: string, resetPasswordToken: string): string {
        const feHost = this.configService.get<string>('FE_HOST');
        const resetPasswordUrl = this.configService.get<string>('RESET_PASSWORD_URL');
        return `${feHost}${resetPasswordUrl}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetPasswordToken)}`;
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
