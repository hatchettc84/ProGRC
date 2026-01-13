import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as crypto from 'crypto';
import { ResetPasswordToken } from "src/entities/resetPasswordToken.entity";
import { User } from "src/entities/user.entity";
import { IsNull, MoreThan, Repository } from "typeorm";

export enum ResetPasswordTokenType {
    RESET_PASSWORD = 'RESET_PASSWORD',
    USER_INVITE = 'USER_INVITE',
}

@Injectable()
export class ResetPasswordTokenService {
    private readonly tokenExpirations: Record<ResetPasswordTokenType, number>;
    
    constructor(
        @InjectRepository(ResetPasswordToken) private readonly resetPasswordTokenRepository: Repository<ResetPasswordToken>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {
        // Initialize token expirations with proper fallbacks to prevent NaN
        const resetPasswordHours = process.env.RESET_PASSWORD_EXPIRY_TOKEN_HOUR;
        const userInviteHours = process.env.USER_INVITATION_EXPIRY_TOKEN_HOUR;
        
        // Safely parse with explicit NaN checking
        let resetPasswordParsed = 24; // Default
        if (resetPasswordHours) {
            const parsed = parseInt(resetPasswordHours, 10);
            if (!isNaN(parsed) && isFinite(parsed) && parsed > 0) {
                resetPasswordParsed = parsed;
            }
        }
        
        let userInviteParsed = 168; // Default (7 days)
        if (userInviteHours) {
            const parsed = parseInt(userInviteHours, 10);
            if (!isNaN(parsed) && isFinite(parsed) && parsed > 0) {
                userInviteParsed = parsed;
            }
        }
        
        this.tokenExpirations = {
            [ResetPasswordTokenType.RESET_PASSWORD]: resetPasswordParsed,
            [ResetPasswordTokenType.USER_INVITE]: userInviteParsed,
        };
        
        // Final validation - ensure no NaN values
        if (isNaN(this.tokenExpirations[ResetPasswordTokenType.RESET_PASSWORD])) {
            this.tokenExpirations[ResetPasswordTokenType.RESET_PASSWORD] = 24;
        }
        if (isNaN(this.tokenExpirations[ResetPasswordTokenType.USER_INVITE])) {
            this.tokenExpirations[ResetPasswordTokenType.USER_INVITE] = 168;
        }
    }

    async createResetPasswordToken(creatorId: string, userId: string, type: string): Promise<string> {
        const user: User = await this.userRepository.findOneOrFail({
            where: {
                id: userId,
            },
            select: ['id', 'email'],
        });

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        
        // Get expiration hours with proper type casting and validation
        const tokenType = type as ResetPasswordTokenType;
        let expirationHours: number;
        
        // Safely get expiration hours with fallback - ensure we always have a valid number
        try {
            if (tokenType === ResetPasswordTokenType.USER_INVITE) {
                expirationHours = this.tokenExpirations[ResetPasswordTokenType.USER_INVITE] || 168;
            } else if (tokenType === ResetPasswordTokenType.RESET_PASSWORD) {
                expirationHours = this.tokenExpirations[ResetPasswordTokenType.RESET_PASSWORD] || 24;
            } else {
                // Default fallback
                expirationHours = 24;
            }
            
            // Validate expirationHours is a valid number - if not, use defaults
            if (typeof expirationHours !== 'number' || isNaN(expirationHours) || expirationHours <= 0 || !isFinite(expirationHours)) {
                console.error(`Invalid token expiration hours: ${expirationHours} for type: ${type}. Using default.`);
                expirationHours = tokenType === ResetPasswordTokenType.USER_INVITE ? 168 : 24;
            }
        } catch (error) {
            console.error(`Error getting expiration hours for type: ${type}. Using default.`, error);
            expirationHours = tokenType === ResetPasswordTokenType.USER_INVITE ? 168 : 24;
        }
        
        // Final safety check - ensure we have a valid number before using it
        if (typeof expirationHours !== 'number' || isNaN(expirationHours) || expirationHours <= 0 || !isFinite(expirationHours)) {
            console.error(`Final check failed for expiration hours: ${expirationHours}. Forcing default.`);
            expirationHours = 168; // Safe default for user invites
        }
        
        // Calculate expiration date
        const currentHours = expiresAt.getHours();
        const newHours = currentHours + expirationHours;
        expiresAt.setHours(newHours);
        
        // Validate the resulting date is valid
        if (isNaN(expiresAt.getTime())) {
            console.error(`Invalid expiration date calculated. Using 7 days from now.`);
            expiresAt.setTime(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days in milliseconds
        }

        const resetPasswordToken = this.resetPasswordTokenRepository.create({
            user_id: user.id,
            user_email: user.email,
            token_hash: crypto.createHash('sha256').update(token).digest('hex'),
            expires_at: expiresAt,
            created_at: new Date(),
            created_by: creatorId
        });

        await this.resetPasswordTokenRepository.save(resetPasswordToken);
        return token;
    }

    async validateToken(email: string, token: string): Promise<boolean> {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const resetPasswordToken = await this.resetPasswordTokenRepository.findOne({
            where: {
                user_email: email,
                token_hash: tokenHash,
                expires_at: MoreThan(new Date()),
                used_at: IsNull(),
            },
            order: {
                created_at: 'DESC'
            },
            select: ['id'],
        });

        return !!resetPasswordToken
    }

    async useToken(email: string, token: string): Promise<void> {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        await this.resetPasswordTokenRepository.update({
            user_email: email,
            token_hash: tokenHash,
        }, {
            used_at: new Date()
        });
    }
}
