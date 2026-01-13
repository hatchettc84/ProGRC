import { BadRequestException, Injectable, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoles } from 'src/masterData/userRoles.entity';
import { Repository } from 'typeorm';
import * as metadata from '../common/metadata';
import { SourceType } from 'src/entities/source/sourceType.entity';
import { Permission } from 'src/entities/permission.entity';
import { LicenseRule } from 'src/entities/licenseRule.entity';
const inviteStatus = metadata['inviteStatus'];
const fileTypes = metadata['fileTypes'];
@Injectable()
export class AppService {
    constructor(
        @InjectRepository(UserRoles) private userRoles: Repository<UserRoles>,
        @InjectRepository(SourceType) private appSourceTypes: Repository<SourceType>,
        @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
        @InjectRepository(LicenseRule) private licenseRuleRepo: Repository<LicenseRule>,
    ) { }


    async getMetadata() {
        const dataObj = {
            company_roles: await this.userRoles.find({
                where: { is_org_role: false }, select: {
                    id: true,
                    role_name: true
                }
            }),
            organization_roles: await this.userRoles.find({
                where: { is_org_role: true }, select: {
                    id: true,
                    role_name: true
                }
            }),
            file_types: fileTypes,
            invite_status: inviteStatus,
            app_source_types: await this.appSourceTypes.find({
                select: ['id', 'name'],
            }),
        };

        return {
            data: dataObj
        }
    }

    async getPermissions():Promise<Permission[]> {
        return await this.permissionRepo.find();
    }

    async getLicenseRules():Promise<LicenseRule[]> {
        return await this.licenseRuleRepo.find();
    }

}
