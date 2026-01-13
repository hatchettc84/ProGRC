import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CognitoService } from "src/auth/cognitoAuth.service";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { ResetPasswordTokenService } from "./resetPasswordToken.service";

@Injectable()
export class ChangePasswordService {
    constructor(
        private readonly cognitoService: CognitoService,
        private readonly resetPasswordTokenSrvc: ResetPasswordTokenService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) { }

    async changeFromResetPassword(token: string, email: string, newPassword: string): Promise<void> {
        const user: User = await this.userRepository.findOneOrFail({
            where: {
                email
            },
            select: ['id']
        });
        const validToken: boolean = await this.resetPasswordTokenSrvc.validateToken(email, token);

        if (!validToken) {
            throw new Error('Invalid token');
        }

        await this.cognitoService.changeUserPassword(user.id, newPassword);
        await this.resetPasswordTokenSrvc.useToken(email, token);
    }
}
