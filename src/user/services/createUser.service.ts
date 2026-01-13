import { InternalUserInviteEmail } from "src/notifications/templates/progrc-email";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CognitoService } from "src/auth/cognitoAuth.service";
import { InviteStatus, User } from "src/entities/user.entity";
import { UserRole, UserRoles } from "src/masterData/userRoles.entity";
import { EmailService } from "src/notifications/email.service";
import { DataSource, EntityManager, QueryFailedError, Repository } from "typeorm";
import { ResetPasswordTokenService, ResetPasswordTokenType } from "./resetPasswordToken.service";
import { DomainCacheService } from "src/cache/domain-cache.service";
import { LoggerService } from "src/logger/logger.service";
import { createUserRequest } from "../user.dto";
import { v4 as uuidv4 } from 'uuid';
interface createUser {
    name: string;
    email: string;
    mobile?: string;
    roleId: UserRole;
}

@Injectable()
export class CreateProGrcUserService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly dataSource: DataSource,
        private cognitoSvc: CognitoService,
        private readonly emailService: EmailService,
        private readonly resetPasswordTokenSrvc: ResetPasswordTokenService,
        private readonly cacheService: DomainCacheService,
        private readonly logger: LoggerService,
    ) { }

    async createUser(userInfo: { userId: string }, data: createUser): Promise<User> {
        const email: string = data.email?.toLowerCase();
        this.validateEmail(email);

        if (!data.name) {
            throw new BadRequestException("Name is required");
        }

        // Mobile is optional
        // if (!data.mobile) {
        //     throw new BadRequestException("Mobile number is required");
        // }

        this.validateInternalRole(data.roleId);

        // Check if user with this email already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: email }
        });

        if (existingUser) {
            throw new BadRequestException(`A user with email ${email} already exists. Please use a different email address.`);
        }

        let user: User;
        try {
            user = await this.dataSource.transaction(async (manager: EntityManager) => {
                const user = this.userRepository.create({
                    id: uuidv4(),
                    name: data.name,
                    email: email,
                    mobile: data.mobile,
                    role_id: data.roleId.valueOf(),
                    invite_status: InviteStatus.SENT,
                });

                return await manager.save(user);
            });
        } catch (error) {
            // Handle duplicate email constraint violation (in case of race condition)
            // Check for QueryFailedError with code 23505 (unique constraint violation)
            
            // Extract error properties safely
            const errorAny = error as any;
            const errorCode = errorAny?.code || errorAny?.driverError?.code || errorAny?.errno;
            const errorConstraint = errorAny?.constraint || errorAny?.driverError?.constraint;
            const errorMessage = error instanceof Error ? error.message : String(error);
            const driverError = errorAny?.driverError || {};
            
            // Check for duplicate email error in multiple ways
            const isDuplicateEmail = 
                (errorCode === '23505' || errorCode === 23505) &&
                (errorConstraint === 'UQ_97672ac88f789774dd47f7c8be3' || 
                 errorConstraint?.includes('email') || 
                 errorMessage?.includes('duplicate key') ||
                 errorMessage?.includes('UQ_97672ac88f789774dd47f7c8be3') ||
                 errorMessage?.toLowerCase().includes('email') ||
                 driverError?.constraint === 'UQ_97672ac88f789774dd47f7c8be3' ||
                 driverError?.constraint?.includes('email'));
            
            if (isDuplicateEmail) {
                throw new BadRequestException(`A user with email ${email} already exists. Please use a different email address.`);
            }
            
            // Log unexpected errors for debugging
            this.logger.error('Unexpected error creating user', { 
                error: errorMessage, 
                code: errorCode,
                constraint: errorConstraint,
                driverErrorCode: driverError?.code,
                driverErrorConstraint: driverError?.constraint,
                stack: error instanceof Error ? error.stack : undefined,
                errorType: error?.constructor?.name,
                isQueryFailedError: error instanceof QueryFailedError
            });
            
            // Re-throw other errors
            throw error;
        }

        // Get actor user with error handling
        const actor: User = await this.userRepository.findOne({ 
            select: ['name', 'id'], 
            where: { id: userInfo.userId } 
        });
        
        if (!actor) {
            this.logger.error(`Actor user not found: ${userInfo.userId}`);
            throw new BadRequestException('Unable to create user: Creator account not found');
        }

        const resetPasswordToken: string = await this.resetPasswordTokenSrvc.createResetPasswordToken(actor.id, user.id, ResetPasswordTokenType.USER_INVITE);
        const roles: UserRoles[] = await this.cacheService.getUserRoles();
        
        // Build invite link with fallback values
        const feHost = process.env.FE_HOST || 'https://app.progrc.com';
        const inviteUrl = process.env.USER_INVITATION_URL || '/auth/invite';
        const inviteLink = `${feHost}${inviteUrl}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetPasswordToken)}`;
        
        const emailBody: string = InternalUserInviteEmail({
            name: user.name,
            roleName: roles.find(role => role.id === data.roleId)?.role_name || '',
            inviterName: actor.name || 'Administrator',
            inviteLink: inviteLink,
        });

        // Send email asynchronously to avoid blocking user creation
        this.emailService.sendEmail(email, [], 'ProGRC - Account Activated. Action Required!', emailBody).catch((error) => {
            this.logger.error(`Failed to send invite email to ${email}`, { error: error.message, stack: error.stack });
            // Don't throw - user creation should succeed even if email fails
        });

        return user;
    }

    private validateEmail(email: string): void {
        if (!email) {
            throw new BadRequestException("Email is required");
        }
        const rfc5322Regex = /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/;
        if (!rfc5322Regex.test(email)) {
            throw new BadRequestException("Invalid email format");
        }

        // For internal users (super admin, CSM), allow any valid email domain
        // The @progrc.com restriction is only for organization users
        // Internal privileged users can have any email address
    }

    private validateInternalRole(roleId: UserRole): void {
        if (!UserRoles.getInternalRoles().includes(roleId)) {
            throw new BadRequestException("Invalid role");
        }
    }

    async createAuditor(userInfo: any, data: createUserRequest): Promise<User> {
        const email: string = data.email?.toLowerCase();
        this.validateEmail(email);

        if (!data.name) {
            throw new BadRequestException("Name is required");
        }

        if (!data.mobile) {
            throw new BadRequestException("Mobile number is required");
        }

        const user: User = await this.dataSource.transaction(async (manager: EntityManager) => {

            const user = this.userRepository.create({
                id: uuidv4(),
                name: data.name,
                email: email,
                mobile: data.mobile,
                role_id: data.roleId.valueOf(),
                invite_status: InviteStatus.SENT,
            });

            return await manager.save(user);
        });

        const actor: User = await this.userRepository.findOneOrFail({ select: ['name', 'id'], where: { id: userInfo.userId } });
        const resetPasswordToken: string = await this.resetPasswordTokenSrvc.createResetPasswordToken(actor.id, user.id, ResetPasswordTokenType.USER_INVITE);
        const roles: UserRoles[] = await this.cacheService.getUserRoles();
        
        // Build invite link with fallback values
        const feHost = process.env.FE_HOST || 'https://app.progrc.com';
        const inviteUrl = process.env.USER_INVITATION_URL || '/auth/invite';
        const inviteLink = `${feHost}${inviteUrl}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetPasswordToken)}`;
        
        const emailBody: string = InternalUserInviteEmail({
            name: user.name,
            roleName: roles.find(role => role.id === data.roleId).role_name,
            inviterName: actor.name,
            inviteLink: inviteLink,
        });

        this.emailService.sendEmail(email, [], 'ProGRC - Account Activated. Action Required!', emailBody);

        return user;
    }
}
