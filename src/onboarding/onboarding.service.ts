import { UserData } from "src/common/interfaces";
import { NewAdminInviteEmail } from 'src/notifications/templates/progrc-email';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadService } from "src/app/fileUpload.service";
import { AuthService } from 'src/auth/auth.service';
import { CognitoService } from 'src/auth/cognitoAuth.service';
import { EmailValidationService } from 'src/auth/emailValidation.service';
import { LoggerService } from 'src/logger/logger.service';
import { App } from 'src/entities/app.entity';
import { AppUser, AppUserRole } from 'src/entities/appUser.entity';
import { Customer } from 'src/entities/customer.entity';
import { OrganizationTemplate } from 'src/entities/organizationTemplate.entity';
import { OrganizationStandards } from 'src/entities/orgnizationStandards.entity';
import { OrganizationFrameworks } from 'src/entities/organizationFrameworks.entity';
//import { Standards } from 'src/entities/standard.entity';
import { Templates } from 'src/entities/template.entity';
import { InviteStatus, User } from 'src/entities/user.entity';
import { UserRole, UserRoles } from 'src/masterData/userRoles.entity';
import { EmailService } from 'src/notifications/email.service';
import { ResetPasswordTokenService, ResetPasswordTokenType } from 'src/user/services/resetPasswordToken.service';
import { DataSource, In, Repository } from 'typeorm';
import * as metadata from '../common/metadata';
const userRoles = metadata['userRoles'];
const inviteStatus = metadata['inviteStatus'];
const StandardNames = metadata['standardData'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; //Bytes
import { Standard } from "src/entities/standard_v1.entity";
import { Framework } from "src/entities/framework.entity";
import { TosHistory } from 'src/entities/tosHistory.entity';
import { AddAuditorDto, ProfileImageUpdateRequest, ProfileImageUpdateResponse } from './user.dto';
import { CustomerCsm } from 'src/entities/customerCsm.entity';
import { LicenseType } from 'src/entities/lincenseType.entity';
import { LicenseRule } from 'src/entities/licenseRule.entity';
import { log } from 'console';
import { generateS3SignedUrl } from 'src/utils/entity-transformer';


@Injectable()
export class OnboardingService {
    constructor(
        private readonly emailValidationSvc: EmailValidationService,
        private readonly authSvc: AuthService,
        private readonly cognitoSvc: CognitoService,
        private readonly uploadSvc: UploadService,
        private readonly dataSource: DataSource,
        @InjectRepository(Customer) private customerRepo: Repository<Customer>,
        @InjectRepository(UserRoles) private rolesRepo: Repository<UserRoles>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(App) private appsRepo: Repository<App>,
        @InjectRepository(Templates) private templateRepo: Repository<Templates>,
        @InjectRepository(OrganizationTemplate) private orgTemplateRepo: Repository<OrganizationTemplate>,
        // @InjectRepository(Standards) private standardsRepository: Repository<Standards>,
        @InjectRepository(OrganizationStandards) private organizationStandardRepo: Repository<OrganizationStandards>,
        @InjectRepository(OrganizationFrameworks) private organizationFrameworkRepo: Repository<OrganizationFrameworks>,
        private readonly dataSouce: DataSource,
        private readonly emailService: EmailService,
        private readonly resetPasswordTokenSrvc: ResetPasswordTokenService,
        @InjectRepository(Framework) private frameworkRepo: Repository<Framework>,
        @InjectRepository(Standard) private standardRepo: Repository<Standard>,
        @InjectRepository(TosHistory) private tosHistoryRepo: Repository<TosHistory>,
        @InjectRepository(CustomerCsm) private customerCsmRepo: Repository<CustomerCsm>,
        @InjectRepository(LicenseType) private licenseTypeRepo: Repository<LicenseType>,
        @InjectRepository(LicenseRule) private licenseRuleRepo: Repository<LicenseRule>,
        @InjectRepository(AppUser) private appUserRepo: Repository<AppUser>,
        private readonly logger: LoggerService,
    ) { }


    async updateOrganization(data: any, userInfo: any) {
        let {
            logo_image_key,//this will be done, when s3 upload is implemented
            organization_name,
            license_type
        } = data;

        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        const toUpdate = {};
        if (organization_name) {
            if (typeof organization_name !== 'string') {
                throw new BadRequestException({
                    error: `Invalid organization_name provided!`,
                    message: `Invalid organization_name provided!`,
                });
            }
            toUpdate['organization_name'] = organization_name;
        }
        if (logo_image_key) {
            toUpdate['logo_image_key'] = logo_image_key;
        }
        if (license_type) {
            toUpdate['license_type'] = license_type;
        }
        if (!Object.keys(toUpdate).length) {
            return {
                message: `Nothing to update!`,
            }
        }

        try {
            await this.customerRepo.update({ id: orgId }, {
                updated_by: userInfo.id,
                ...toUpdate
            });
            return {
                message: `Organization info updated successfully!`,
            }
        } catch (error) {
            throw new BadRequestException({
                error: `Something went wrong when updating organization!`,
                message: error.message,
            })
        }
    }

    async markOrganizationOnboardingComplete(userInfo: any) {
        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        try {
            await this.customerRepo.update({ id: orgId }, {
                is_onboarding_complete: true,
                updated_by: userInfo.id,
            });
            return {
                message: `Organization info updated successfully!`,
            }
        } catch (error) {
            throw new BadRequestException({
                error: `Something went wrong when updating organization!`,
                message: error.message,
            })
        }
    }

    async addOrgTeamMembers(data: any, userInfo: any) {
        const orgId = userInfo['tenant_id'];
        const userId = userInfo['userId'];
        const customer = await this.customerRepo.findOne({
            where: { id: orgId }
        });
        if (!customer) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        const usersArray = data;
        if (!Array.isArray(usersArray) || !usersArray.length) {
            throw new BadRequestException({
                error: `No Users provided!`,
                message: `No Users provided!`,
            });
        }
        const dataToCreate = [];
        const allowedRoles = await this.rolesRepo.find({
            where: {
                is_org_role: true
            }
        });
        const alreadyTakenEmail = {};
        for (let i = 0; i < usersArray.length; i++) {
            const user = usersArray[i];

            let { email, name, role_id } = user;
            if (!email) {
                throw new BadRequestException({
                    message: 'No email provided!'
                });
            }
            this.emailValidationSvc.validateEmail(email);
            if (alreadyTakenEmail[email]) {
                throw new BadRequestException({
                    message: `Duplicate email(${email}) provided!`,
                    error: `Duplicate email(${email}) provided!`,
                });
            }
            alreadyTakenEmail[email] = true;

            if (!name) {
                throw new BadRequestException({
                    message: 'No name provided!'
                });
            }

            if (!allowedRoles.some(rl => rl.id == role_id)) {
                throw new BadRequestException({
                    message: `Invalid role_id (${role_id}) provided!`
                });
            }

            dataToCreate.push({
                name,
                email,
                role_id,
                role: (allowedRoles.filter(rl => rl.id == role_id)[0]).role_name,
            });
        }
        try {
            const actor: User = await this.userRepo.findOneOrFail({ where: { id: userId }, select: ['id', 'name'] });
            for (let i = 0; i < dataToCreate.length; i++) {
                const user = dataToCreate[i];
                let { email, name, role_id, role } = user;

                let createdUser: User;
                await this.dataSouce.transaction(async (manager) => {
                    createdUser = await this.authSvc.createUser(orgId, name, email, role, role_id, manager);
                    if (role_id === userRoles.auditor) {
                        await this.customerCsmRepo.save({
                            customer_id: orgId,
                            user_id: createdUser.id,
                            role_id: role_id
                        });
                    }
                });

                const resetPasswordToken: string = await this.resetPasswordTokenSrvc.createResetPasswordToken(actor.id, createdUser.id, ResetPasswordTokenType.USER_INVITE);
                const emailBody: string = NewAdminInviteEmail({
                    adminName: name,
                    orgName: customer.organization_name,
                    inviterName: actor.name,
                    inviteLink: `${process.env.FE_HOST}${process.env.USER_INVITATION_URL}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetPasswordToken)}`,
                });

                this.emailService.sendEmail(email, [], `ProGRC - You're invited to join ${customer.organization_name}`, emailBody);
            }
            return {
                message: `Member/s created successfully and invite sent on email!`
            }
        } catch (error) {
            throw new BadRequestException({
                error: `Something went wrong when creating member!`,
                message: error.message,
            })
        }
    }

    async reInviteOrgTeamMembers(body: any, userInfo: any) {
        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        const { email } = body;
        if (!email) {
            throw new BadRequestException({
                error: `No email provided!`,
                message: `No email provided!`,
            });
        }
        //check if this user is eligible for this action or not
        const user = await this.userRepo.findOne({
            where: {
                email
            }
        });
        if (!user) {
            throw new BadRequestException({
                error: `User not found!`,
                message: `User not found!`,
            })
        }
        const orgMemberInfo = await this.userRepo.findOne({
            where: {
                id: user.id,
                customer_id: orgId
            }
        });
        if (!orgMemberInfo) {
            throw new BadRequestException({
                error: `User does not exists in the organization you belong to!`,
                message: `User does not exists in the organization you belong to!`,
            })
        }
        const invStatus = orgMemberInfo.invite_status;
        if ([inviteStatus.not_needed, inviteStatus.joined].includes(invStatus)) {
            throw new BadRequestException({
                error: `Can not re-send invite to this user. This user has already joined.`,
                message: `Can not re-send invite to this user. This user has already joined.`,
            });
        }
        try {
            await this.cognitoSvc.resendInvitationEmail(email);
            orgMemberInfo.invite_status = inviteStatus.resent;
            await this.userRepo.save(orgMemberInfo);
            return {
                message: `Invite again sent on email!`
            }
        } catch (error) {
            throw new BadRequestException({
                error: error.message,
                message: error.message,
            })
        }
    }

    async getOrganizationInfo(userInfo: any) {
        // Support both tenant_id and customerId (for impersonation compatibility)
        const orgId = userInfo['tenant_id'] || userInfo['customerId'];
        
        if (!orgId) {
            this.logger.warn(`getOrganizationInfo: No tenant_id or customerId found in userInfo`, {
                userInfoKeys: Object.keys(userInfo || {}),
                userId: userInfo?.['userId'],
                email: userInfo?.['email']
            });
            return {
                data: null,
                message: `No organization ID found in user context. tenant_id: ${userInfo['tenant_id']}, customerId: ${userInfo['customerId']}`
            };
        }

        this.logger.log(`getOrganizationInfo: Fetching organization with ID: ${orgId}`);
        
        const org = await this.customerRepo.findOne({
            where: {
                id: orgId
            },
            relations: ['customer_csms', 'customer_csms.user', 'licenseType', 'licenseType.licenseRule']
        });

        if (org) {
            this.logger.log(`getOrganizationInfo: Successfully found organization: ${org.organization_name} (${org.id})`);
            return {
                data: {
                    id: org.id,
                    logo_image_key: org.logo_image_key,
                    owner_id: org.owner_id,
                    organization_name: org.organization_name,
                    license_type: org.license_type,
                    license_type_data: org.licenseType,
                    license_start_date: org.license_start_date,
                    license_end_date: org.license_end_date,
                    license_type_id: org.license_type_id,
                    created_by: org.created_by,
                    updated_by: org.updated_by,
                    is_onboarding_complete: org.is_onboarding_complete,
                    created_at: org.created_at,
                    updated_at: org.updated_at,
                    csms: org.customer_csms.map(csm => {
                        return {
                            id: csm.user.id,
                            name: csm.user.name,
                            email: csm.user.email,
                            created_at: csm.created_at
                        }
                    })
                }
            }
        }
        
        this.logger.warn(`getOrganizationInfo: Organization with id ${orgId} not found`);
        return {
            data: null,
            message: `Organization with id ${orgId} not found`
        }
    }

    async getAllOrganizations() {
        const orgs = await this.customerRepo.find({
            select: {
                id: true,
                organization_name: true,
                license_type: true,
                is_onboarding_complete: true,
                created_at: true,
                license_type_id: true,
                created_by_user: {
                    name: true,
                    email: true
                },
                licenseType: {
                    id: true,
                    name: true
                }
            },
            relations: ['created_by_user', 'licenseType'],
            order: {
                created_at: 'DESC'
            }
        });

        const transformedOrgs = orgs.map(({ created_by_user, licenseType, ...org }) => ({
            ...org,
            created_by: created_by_user,
            license_type: org.license_type || (licenseType ? licenseType.name : null),
        }));

        return {
            data: transformedOrgs,
        };
    }

    async getAllUsers() {
        const members = await this.userRepo.find({
            select: {
                id: true,
                name: true,
                email: true,
                role_id: true,
                invite_status: true,
                customer_id: true,
                customer: {
                    id: true,
                    license_type: true,
                    organization_name: true,
                    logo_image_key: true,
                    is_onboarding_complete: true,
                },
                role: {
                    id: true,
                    role_name: true
                },
                created_at: true
            },
            relations: {
                role: true,
                customer: true
            },
            order: {
                created_at: 'DESC'
            }
        });
        return {
            data: members && members.length ? members.map(mem => {
                return {
                    id: String(mem.id),
                    invite_status: mem.invite_status,
                    organization_id: mem.customer_id,
                    created_at: mem.created_at,
                    user_info: {
                        role_name: mem.role.role_name,
                        name: mem.name,
                        email: mem.email,
                        role_id: mem.role_id
                    },
                    org_info: {
                        logo_image_key: mem.customer.logo_image_key,
                        organization_name: mem.customer.organization_name,
                        license_type: mem.customer.license_type,
                        is_onboarding_complete: mem.customer.is_onboarding_complete
                    }
                }
            }) : []
        }
    }

    async getOrganizationMembers(userInfo: any, fetchJoinedOnly = false) {
        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        const members = await this.userRepo.find({
            where: {
                customer_id: orgId,
                invite_status: !!fetchJoinedOnly ? inviteStatus['joined'] : null
            },
            relations: {
                role: true
            }
        });

        if (!members) {
            return {
                data: []
            }
        }
        return {
            data: members.map(m => {
                return {
                    role: m.role.role_name,
                    name: m.name,
                    mobile: m.mobile,
                    profile_image_key: m.profile_image_key,
                    email: m.email,
                    role_id: m.role_id,
                    created_at: m.created_at,
                    invite_status: m.invite_status,
                    organization_id: m.customer_id,
                    user_id: m.id
                }
            })
        }
    }

    async getOrgDetails(org_id: string) {
        const orgId = org_id;

        const customer: Customer = await this.customerRepo.findOne({
            where: { id: orgId },
            relations: ['members', 'members.role', 'customer_csms', 'customer_csms.user', 'licenseType', 'licenseType.licenseRule']
        });

        if (!customer) {
            return {};
        }
        const auditor_ids = await this.customerCsmRepo.find({
            where: { customer_id: orgId, role_id: UserRole.AUDITOR }
        });

        const auditors = await this.userRepo.find({
            where: { id: In(auditor_ids.map(auditor => auditor.user_id)) },
            relations: ['role']
        });
        const orgLogoSignedUrl = await generateS3SignedUrl(customer.logo_image_key);
        return {
            data: {
                id: customer.id,
                logo_image_key: orgLogoSignedUrl,
                organization_name: customer.organization_name,
                license_type: customer.licenseType.name,
                license_type_data: customer.licenseType,
                license_type_id: customer.license_type_id,
                license_start_date: customer.license_start_date,
                license_end_date: customer.license_end_date,
                is_onboarding_complete: customer.is_onboarding_complete,
                created_at: customer.created_at,
                notes: customer.notes,
                members: customer.members.map(user => {
                    return {
                        id: user.id,
                        invite_status: user.invite_status,
                        user_id: user.id,
                        created_at: user.created_at,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            profile_image_key: user.profile_image_key,
                            mobile: user.mobile,
                            role: {
                                id: user.role?.id,
                                role_name: user.role?.role_name
                            }
                        }
                    }
                }),
                csms: customer.customer_csms
                    .filter(csm => csm.role_id === 5)
                    .map(csm => {
                        return {
                            id: csm.user.id,
                            created_at: csm.created_at,
                            name: csm.user.name,
                            email: csm.user.email,
                        }
                    }),
                auditors: auditors.map(auditor => {
                    return {
                        id: auditor.id,
                        name: auditor.name,
                        email: auditor.email,
                        role: auditor.role.role_name,
                        inviteStatus: auditor.invite_status,
                    }
                }),
            }
        };
    }

    async updateProfileInfo(data: any, userInfo: any) {
        const userId = userInfo['userId'];
        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }
        let {
            name,
            mobile,
            profile_image_key,
        } = data;

        const toUpdate = {};
        if (name) {
            toUpdate['name'] = name;
        }
        if (mobile) {
            toUpdate['mobile'] = mobile;
        }
        if (profile_image_key) {
            toUpdate['profile_image_key'] = profile_image_key;
        }
        if (!Object.keys(toUpdate).length) {
            throw new BadRequestException({
                error: `Nothing to update!`,
                message: `Nothing to update!`,
            });
        }
        try {
            await this.userRepo.update({ id: userId }, { ...toUpdate });
            return {
                message: `User Profile updated successfully!`
            }
        } catch (error) {
            throw new BadRequestException({
                error: error.message,
                message: error.message,
            })
        }
    }

    async getProfileInfo(userInfo: any) {
        const userId = userInfo['userId'];
        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }

        const user: User = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return { data: {} };
        }

        const invitationStatus = await this.userRepo.findOneBy({
            id: userId,
            invite_status: In([inviteStatus.sent, inviteStatus.resent, inviteStatus.reset_password])
        });

        if (invitationStatus) {
            invitationStatus.invite_status = inviteStatus.joined;
            this.userRepo.save(invitationStatus);
        }

        return { data: user };
    }

    async getOrgApps(userInfo: any) {
        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        try {
            const apps = await this.appsRepo
                .createQueryBuilder('app')
                .leftJoin('app.appUsers', 'appUser', 'appUser.role = :role', { role: AppUserRole.OWNER })
                .leftJoinAndMapOne('app.owner', 'users', 'owner', 'appUser.user_id = owner.id')
                .where('app.customer_id = :tenantId', { tenantId: orgId })
                .orderBy('app.created_at', 'DESC')
                .getMany();

            return {
                data: apps
            }
        } catch (error) {
            throw new BadRequestException({
                error: error.message,
                message: error.message,
            })
        }
    }

    async getOrgAppDetail(appId: number, userInfo: any) {
        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        try {
            const app = await this.appsRepo
                .createQueryBuilder('app')
                .leftJoin('app.appUsers', 'appUser', 'appUser.role = :role', { role: AppUserRole.OWNER })
                .leftJoinAndMapOne('app.owner', 'users', 'owner', 'appUser.user_id = owner.id')
                .where('app.id = :appId', { appId })
                .andWhere('app.customer_id = :tenantId', { tenantId: orgId })
                .getOne();

            return {
                data: app
            }
        } catch (error) {
            throw new BadRequestException({
                error: error.message,
                message: error.message,
            })
        }
    }

    async updateAppData(appId: number, data: any, userInfo: any) {
        const orgId = userInfo['tenant_id'];
        const userId = userInfo['userId'];
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        const existingApp = await this.appsRepo.findOne({
            where: {
                id: appId,
                customer_id: orgId
            }
        });
        if (!existingApp) {
            throw new ForbiddenException({
                error: 'Application not found.',
                message: 'Application not found.',
            });
        }

        const orgMembers = await this.userRepo.find({
            where: {
                customer_id: orgId
            }
        });
        const orgMembersMap = {};
        orgMembers.forEach(mbr => {
            orgMembersMap[mbr.id] = mbr;
        });

        const date = new Date();
        const app = data;
        const commonData = {
            updated_by_user_id: userId,
            updated_at: date
        }
        const appData = {};

        let { name, owner_id, desc, url, tags } = app;
        if (name) {
            appData['name'] = name;
        }
        if (desc) {
            appData['desc'] = desc;
        }
        if (url) {
            appData['url'] = url;
        }
        if (tags) {
            appData['tags'] = tags;
        }
        if (owner_id) {
            if (!orgMembersMap[owner_id]) {
                throw new BadRequestException({
                    error: `Invalid Owner Id provided for the app with name ${name}. No such user exists in your organization.`,
                    message: `Invalid Owner Id provided for the app with name ${name}. No such user exists in your organization.`,
                });
            }
            appData['owner_id'] = owner_id;
        }

        if (!Object.keys(appData).length) {
            throw new BadRequestException({
                error: `Nothing to update!`,
                message: `Nothing to update!`,
            })
        }
        try {
            await this.appsRepo.update({ id: appId }, { ...appData, ...commonData });
            return {
                message: `Application data updated successfully!`
            }
        } catch (error) {
            throw new BadRequestException({
                error: error.message,
                message: error.message,
            })
        }
    }

    async getTemplates(userInfo: any): Promise<Templates[]> {
        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        const userId = userInfo['userId'];
        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }
        let templates = await this.templateRepo
            .createQueryBuilder('template')
            .select(['template.id', 'template.name', 'template.upload_date', 'template.update_date', 'template.customer_ids', 'template.standard_ids'])
            .distinctOn(['template.name'])  // Ensure distinct on name
            .where('template.is_published = :isPublished', { isPublished: true })
            .orderBy('template.name', 'ASC') // Order by name first
            .addOrderBy('template.update_date', 'DESC') // Then order by update_date to get the latest
            .getMany();

        templates = templates.filter((template) => {
            if (template.customer_ids && template.customer_ids.length) {
                return template.customer_ids.includes(orgId);
            } else {
                return true;
            }

        });

        return templates;
    }


    async mapTemplates(data: any, userInfo: any) {
        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.findOne({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        const userId = userInfo['userId'];
        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }
        if (!data) {
            throw new ForbiddenException({
                error: `No standards selceted!`,
                message: `No standards selceted!`,
            });
        }
        let templateName: any[];
        if (Array.isArray(data.templates)) {
            templateName = data.templates
        }

        await this.orgTemplateRepo.delete({ customer_id: orgId });

        const templates = await this.templateRepo.find({
            where: {
                name: In(templateName),
            },
        });
        for (const template of templates) {
            if (template.customer_ids && template.customer_ids.length) {
                if (!template.customer_ids.includes(orgId)) {
                    continue;
                }
            }
            const organizationTemplate = this.orgTemplateRepo.create({
                customer_id: orgId,
                template: template
            });

            await this.orgTemplateRepo.save(organizationTemplate);
        }
    }


    async uploadTemplatesToS3(req: any, files: Array<Express.Multer.File>) {
        const userInfo = req['user_data'];
        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.findOne({ where: { id: orgId } });

        if (!count || !userInfo['userId']) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User or organization!`,
            });
        }

        if (!req.body || !files || !files.length) {
            throw new BadRequestException({
                message: `No files or template info provided!`,
            });
        }

        const { files_info } = req.body;
        if (!files_info) {
            throw new BadRequestException({
                message: `Please send files_info in json array.`,
            });
        }

        let parsedFilesInfo, response;
        try {
            parsedFilesInfo = JSON.parse(files_info);
            if (!Array.isArray(parsedFilesInfo)) throw new Error("Invalid files_info array");

            if (files.length !== parsedFilesInfo.length) {
                throw new Error(`Mismatch between files and files_info count.`);
            }

            response = await this.uploadSvc.uploadFiles(files, parsedFilesInfo, {
                tenant_id: userInfo.tenant_id || -1,
            });
        } catch (error) {
            throw new BadRequestException({
                message: error.message,
            });
        }

        if (!response.data) {
            throw new BadRequestException({
                message: `Problem with response data`,
            });
        }

        let tempName: string[] = [];
        await this.dataSource.transaction(async (manager) => {
            for (let i = 0; i < response.data.length; i++) {
                const file = response.data[i];
                const fileInfo = parsedFilesInfo[i];

                tempName.push(file.file_name);

                const standardId = fileInfo.standard_id ? fileInfo.standard_id : null;
                const template = this.templateRepo.create({
                    name: file.file_name,
                    location: file.key,
                    standard_id: standardId,
                    uploadDate: new Date(),
                });

                await manager.save(template);
            }
        });

        const templates = await this.templateRepo
            .createQueryBuilder('template')
            .where('template.name IN (:...tempName)', { tempName })
            .distinctOn(['template.name'])  // This ensures we get distinct entries by name
            .orderBy('template.name', 'ASC') // Order first by name
            .addOrderBy('template.update_date', 'DESC') // Then by latest update_date
            .getMany();

        return templates;
    }


    async findFramework(userInfo: any) {
        const orgId = userInfo['tenant_id'] || userInfo['customerId'];
        const user_id = userInfo['userId'];
        const role_id = userInfo['role_id'];
        
        // SuperAdmin (role 1) and CSM (role 5) can see all frameworks even without customer_id
        // Regular users need to be linked to an organization
        if (!user_id) {
            throw new ForbiddenException({
                error: 'Invalid User!',
                message: 'Invalid User!',
            });
        }

        // Allow SuperAdmin and CSM to see all frameworks, or users with an organization
        if (role_id === 1 || role_id === 5 || orgId) { // Role 1 = SuperAdmin, Role 5 = CSM
            const allFrameworksCount = await this.frameworkRepo.count();
            const activeFrameworksCount = await this.frameworkRepo.count({ where: { active: true } });
            
            this.logger.log(`[findFramework] Query - Total: ${allFrameworksCount}, Active: ${activeFrameworksCount}, User: ${user_id}, Role: ${role_id}, OrgId: ${orgId}`);
            
            const frameworks = await this.frameworkRepo.find({ 
                where: { active: true },
                order: { name: 'ASC' }
            });
            
            if (!frameworks || frameworks.length === 0) {
                this.logger.warn(`[findFramework] No active frameworks found. Total frameworks in DB: ${allFrameworksCount}, Active: ${activeFrameworksCount}`);
                return [];
            }
            
            this.logger.log(`[findFramework] Returning ${frameworks.length} frameworks`);
            return frameworks;
        }
        
        // If user doesn't meet criteria, return empty array
        this.logger.warn(`[findFramework] User ${user_id} (Role: ${role_id}, OrgId: ${orgId}) doesn't meet criteria to view frameworks`);
        return [];
    }

    async findSelectedFrameworks(organizationId: string, userInfo: any) {
        const role_id = userInfo['role_id'];
        const userOrgId = userInfo['tenant_id'] || userInfo['customerId'];
        
        // SuperAdmin (role 1) and CSM (role 5) can view frameworks for any organization
        // Regular users can only view frameworks for their own organization
        const orgId = (role_id === 1 || role_id === 5) ? organizationId : userOrgId;
        
        if (!orgId) {
            throw new ForbiddenException({
                error: 'Organization ID is required.',
                message: 'Organization ID is required.',
            });
        }

        const selectedFrameworks = await this.organizationFrameworkRepo.find({
            where: { customer_id: orgId },
            relations: ['framework'],
        });

        return selectedFrameworks.map((orgFramework) => ({
            id: orgFramework.framework.id,
            name: orgFramework.framework.name,
            description: orgFramework.framework.description,
            active: orgFramework.framework.active,
        }));
    }

    async uploadSelectedFrameworks(data: any, userInfo: any) {
        // Allow SuperAdmin/CSM to specify organizationId in request body, otherwise use user's customerId
        const orgId = data.organizationId || userInfo['customerId'] || userInfo['tenant_id'];
        const role_id = userInfo['role_id'];
        
        // SuperAdmin (role 1) and CSM (role 5) can manage frameworks for any organization
        if (!orgId && role_id !== 1 && role_id !== 5) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        
        const customer = await this.customerRepo.findOne({
            where: { id: orgId }
        });
        if (!customer) {
            throw new ForbiddenException({
                error: 'Organization not found.',
                message: 'Organization not found.',
            });
        }

        const userId = userInfo['userId'];
        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }

        if (!data || !data.frameworks) {
            throw new BadRequestException({
                error: `No frameworks selected!`,
                message: `No frameworks selected!`,
            });
        }

        let frameworkIds: number[];
        if (Array.isArray(data.frameworks)) {
            frameworkIds = data.frameworks;
        } else {
            throw new BadRequestException({
                error: `Invalid frameworks format!`,
                message: `Frameworks should be an array of IDs.`,
            });
        }

        // Delete existing records for this customer ID
        await this.organizationFrameworkRepo.delete({ customer: { id: orgId } });
        
        const queryBuilder = this.frameworkRepo.createQueryBuilder('framework');
        queryBuilder.where('framework.id IN (:...ids)', { ids: frameworkIds });

        const frameworks = await queryBuilder.getMany();

        for (const framework of frameworks) {
            const organizationFramework = this.organizationFrameworkRepo.create({
                customer: customer,
                framework: framework,
                created_by: userId,
                updated_by: userId
            });

            await this.organizationFrameworkRepo.save(organizationFramework);
        }

        return { message: 'Frameworks updated successfully' };
    }

    async findStandards_v1(userInfo: any) {
        const orgId = userInfo['tenant_id'] || userInfo['customerId'];
        const user_id = userInfo['userId'];
        const role_id = userInfo['role_id'];
        
        // SuperAdmin (role 1) and CSM (role 5) can see all standards even without customer_id
        // Regular users need to be linked to an organization
        if (!user_id) {
            throw new ForbiddenException({
                error: 'Invalid User!',
                message: 'Invalid User!',
            });
        }

        // Allow SuperAdmin and CSM to see all standards, or users with an organization
        if (role_id === 1 || role_id === 5 || orgId) { // Role 1 = SuperAdmin, Role 5 = CSM
            // First check if any standards exist at all (active or inactive)
            const allStandardsCount = await this.standardRepo.count();
            const activeStandardsCount = await this.standardRepo.count({ where: { active: true } });
            
            this.logger.log(`[findStandards_v1] Query - Total: ${allStandardsCount}, Active: ${activeStandardsCount}, User: ${user_id}, Role: ${role_id}, OrgId: ${orgId}`);
            
            const standards = await this.standardRepo.find({
                where: { active: true },
                order: { index: 'DESC' } // Order by the index column
            });
            
            if (!standards || standards.length === 0) {
                this.logger.warn(`[findStandards_v1] No active standards found. Total standards in DB: ${allStandardsCount}, Active: ${activeStandardsCount}`);
                // Return empty array instead of throwing - allows UI to show appropriate message
                return [];
            }
            
            const standardsWithFrameworkName = await Promise.all(standards.map(async (standard) => {
                const framework = await this.frameworkRepo.findOne({
                    where: { id: standard.framework_id }
                });
                return {
                    ...standard,
                    framework_name: framework ? framework.name : null,
                };
            }));
            
            this.logger.log(`[findStandards_v1] Returning ${standardsWithFrameworkName.length} standards with framework names`);
            return standardsWithFrameworkName;
        }
        
        // If user doesn't meet criteria, return empty array
        this.logger.warn(`[findStandards_v1] User ${user_id} (Role: ${role_id}, OrgId: ${orgId}) doesn't meet criteria to view standards`);
        return [];
    }

    async uploadSelectedStandards(data: any, userInfo: any) {
        // Allow SuperAdmin/CSM to specify organizationId in request body, otherwise use user's customerId
        const orgId = data.organizationId || userInfo['customerId'];
        const role_id = userInfo['role_id'];
        
        // SuperAdmin (role 1) and CSM (role 5) can manage standards for any organization
        if (!orgId && role_id !== 1 && role_id !== 5) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        
        const customer = await this.customerRepo.findOne({
            where: { id: orgId }
        });
        if (!customer) {
            throw new ForbiddenException({
                error: 'Organization not found.',
                message: 'Organization not found.',
            });
        }

        const userId = userInfo['userId'];
        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }

        if (!data) {
            throw new ForbiddenException({
                error: `No standards selected!`,
                message: `No standards selected!`,
            });
        }

        let standardIds: number[];
        if (Array.isArray(data.standards)) {
            standardIds = data.standards;
        } else {
            throw new ForbiddenException({
                error: `Invalid standards format!`,
                message: `Standards should be an array of IDs.`,
            });
        }

        // Delete existing records for this customer ID in organizationStandardRepo
        await this.organizationStandardRepo.delete({ customer: { id: orgId } });
        const queryBuilder = this.standardRepo.createQueryBuilder('standard');
        queryBuilder.where('standard.id IN (:...ids)', { ids: standardIds });

        const standards = await queryBuilder.getMany();

        for (const standard of standards) {
            const organizationStandard = this.organizationStandardRepo.create({
                customer: customer,
                standards: standard,
                created_by: userId,
                updated_by: userId
            });

            await this.organizationStandardRepo.save(organizationStandard);
        }
    }

    async saveAcceptedTosDate(userInfo: any, ipAddress: string) {
        const userId = userInfo['userId'];
        let customerId = "-1";
        const role_id = userInfo['role_id'];
        if (role_id === 3 || role_id === 4) {
            customerId = userInfo['customerId'];
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            user.tos_accepted_at = new Date();
            await queryRunner.manager.save(user);

            const tosHistory = this.tosHistoryRepo.create({
                user_id: userId,
                customer_id: customerId,
                accepted_at: user.tos_accepted_at,
                ip_address: ipAddress
            });
            await queryRunner.manager.save(tosHistory);

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException({
                error: error.message,
                message: "Something went wrong",
            });
        } finally {
            await queryRunner.release();
        }
    }

    async updateProfileImage(userInfo, data: ProfileImageUpdateRequest): Promise<ProfileImageUpdateResponse> {
        const userId = userInfo['userId'];
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!data || !data.uuid) {
            throw new BadRequestException({
                error: 'Invalid request',
                message: 'Invalid request',
            });
        }

        if (data.uuid !== userId) {
            throw new ForbiddenException({
                error: 'Invalid user',
                message: 'Invalid user',
            });
        }

        if (!user.temp_profile_image_key) {
            throw new BadRequestException({
                error: 'No temporary image found',
                message: 'No temporary image found',
            });
        }

        user.profile_image_key = user.temp_profile_image_key;
        user.temp_profile_image_key = null;
        user.image_updated_at = new Date();
        user.is_profile_image_available = true;
        await this.userRepo.save(user);
        return new ProfileImageUpdateResponse(true, data.uuid);

    }

    async updateOrgLicense(body: any, userData: UserData, customerId: string) {
        const { license_type_id, license_start_date, license_end_date } = body;
        const userId = userData['userId'];
        const isAssignedCsm = await this.customerCsmRepo.find({ where: { customer_id: customerId, role_id: UserRole.CSM } });
        const assignedCsm = isAssignedCsm.find(csm => csm.user_id === userId);

        if (!assignedCsm) {

            throw new ForbiddenException({
                error: 'You are not assigned as CSM for this organization.',
                message: 'You are not assigned as CSM for this organization.',
            });
        }
        if (!customerId) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }
        let licenseType: LicenseType;
        if (!license_type_id) {
            throw new BadRequestException({
                error: `No license_type_id provided!`,
                message: `No license_type_id provided!`,
            });
        } else {
            licenseType = await this.licenseTypeRepo.findOne({ where: { id: license_type_id } });
            if (!licenseType) {
                throw new BadRequestException({
                    error: `Invalid license_type provided!`,
                    message: `Invalid license_type provided!`,
                });
            }
        }
        if (!license_start_date) {
            throw new BadRequestException({
                error: "License Start Date is required",
                message: "License Start Date is required",
            });
        }

        if (isNaN(Date.parse(license_start_date))) {
            throw new BadRequestException({
                error: "Invalid License Start Date",
                message: "License Start Date must be a valid date",
            });
        }

        if (!license_end_date) {
            throw new BadRequestException({
                error: "License End Date is required",
                message: "License End Date is required",
            });
        }

        if (isNaN(Date.parse(license_end_date))) {
            throw new BadRequestException({
                error: "Invalid License End Date",
                message: "License End Date must be a valid date",
            });
        }
        return await this.customerRepo.update({ id: customerId }, { license_type: licenseType.name, license_type_id: licenseType.id, license_start_date, license_end_date, updated_by: userId, updated_at: new Date() });
    }

    getOrgLicense(userData: UserData) {
        return this.licenseTypeRepo.find({ relations: ['licenseRule'] });
    }

    async getOrganizationAuditors(userInfo: any, fetchJoinedOnly = false) {
        const customer_id = userInfo['customerId'];

        const auditors = await this.customerCsmRepo.find({
            where: {
                role_id: UserRole.AUDITOR,
                customer_id: customer_id,
            },
            relations: ['user'],
        });

        if (!auditors) {
            return {
                data: []
            };
        }

        return {
            data: auditors.map(auditor => {
                const user = auditor.user;
                if (user.invite_status === InviteStatus.JOINED) {
                    return {
                        role: 'Auditor',
                        name: user.name,
                        mobile: user.mobile,
                        profile_image_key: user.profile_image_key,
                        email: user.email,
                        role_id: auditor.role_id,
                        created_at: user.created_at,
                        invite_status: user.invite_status,
                        organization_id: auditor.customer_id,
                        user_id: user.id
                    };
                }
            })
        };
    }

    async addOrgAuditor(userData: AddAuditorDto, userInfo: any) {

        const { userId, customerId, roleId } = userData;

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException({
                error: `User with ID ${userId} not found.`,
                message: `User with ID ${userId} not found.`,
            });
        }
        const customer = await this.customerRepo.findOne({ where: { id: customerId } });
        if (!customer) {
            throw new BadRequestException({
                error: `Customer with ID ${customerId} not found.`,
                message: `Customer with ID ${customerId} not found.`,
            });
        }

        const existingAuditor = await this.customerCsmRepo.findOne({
            where: { user_id: userId, customer_id: customerId, role_id: roleId },
        });

        if (existingAuditor) {
            throw new BadRequestException({
                error: `User with ID ${userId} is already assigned as an auditor for customer with ID ${customerId}.`,
                message: `User with ID ${userId} is already assigned as an auditor for customer with ID ${customerId}.`,
            });
        }

        const customerCsm = this.customerCsmRepo.create({
            user_id: userId,
            customer_id: customerId,
            role_id: roleId,
            created_by: userInfo.userId,
        });

        await this.customerCsmRepo.save(customerCsm);

        return {
            message: 'Auditor successfully added.',
        };
    }

    async getAuditorCustomers(userInfo: any, fetchJoinedOnly = false) {
        const userId = userInfo['userId'];
        const auditors = await this.customerCsmRepo.find({
            where: {
                role_id: UserRole.AUDITOR,
                user_id: userId,
            },
            relations: ['customer'],
        });

        if (!auditors) {
            return {
                data: []
            };
        }

        const customerIds = auditors.map(auditor => auditor.customer_id);
        const apps = await this.appsRepo.find({
            where: {
                customer_id: In(customerIds)
            },
            select: ['id', 'customer_id']
        });

        const appCounts = await Promise.all(customerIds.map(async (customerId) => {
            const appIds = apps.filter(app => app.customer_id === customerId).map(app => app.id);
            const appCount = await this.appUserRepo.count({
                where: {
                    app_id: In(appIds),
                    user_id: userId
                }
            });
            return { customerId, appCount };
        }));

        return auditors.map(auditor => {
            const appCount = appCounts.find(count => count.customerId === auditor.customer_id)?.appCount || 0;
            return {
                ...auditor,
                app_count: appCount
            };
        });
    }

    async removeOrgAuditor(userData: AddAuditorDto, userInfo: any): Promise<{ message: string }> {
        const { userId, customerId, roleId } = userData;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException(`User with ID ${userId} not found.`);
        }
        const customer = await this.customerCsmRepo.findOne({ where: { customer_id: customerId, user_id: userId, role_id: roleId } });
        if (!customer) {
            throw new BadRequestException(`Auditor with ID ${userId} not assigned to customer with ID ${customerId}.`);
        }

        const app_id = await this.appsRepo.find({ where: { customer_id: customerId } });

        const app_ids = app_id.map(app => app.id);
        await this.appUserRepo.delete({ app_id: In(app_ids), user_id: userId });
        await this.customerCsmRepo.delete({ customer_id: customerId, user_id: userId, role_id: roleId });

        return { message: 'Auditor successfully unassigned.' };
    }

}
