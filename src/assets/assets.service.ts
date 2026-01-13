import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { App } from 'src/entities/app.entity';
import { AppUser, AppUserRole } from 'src/entities/appUser.entity';
import { Customer } from 'src/entities/customer.entity';
import { Asset } from 'src/entities/source/assets.entity';
import { SourceType } from 'src/entities/source/sourceType.entity';
import { User } from 'src/entities/user.entity';
import { UserRoles } from 'src/masterData/userRoles.entity';
import { In, Repository } from 'typeorm';

type AssetWithSourceTypeName = Asset & { source_type_name?: string };
@Injectable()
export class AssetsService {
    constructor(
        @InjectRepository(Asset)
        private assetRepo: Repository<Asset>,
        @InjectRepository(Customer) private customerRepo: Repository<Customer>,
        @InjectRepository(App) private appsRepo: Repository<App>,
        @InjectRepository(SourceType) private sourceTypeRepo: Repository<SourceType>,
        @InjectRepository(User) private userRepo: Repository<User>,
    ) { }

    // Fetch asset by sourceType
    // Extend the Asset type to include source_type_name
    // async getAssetById(
    //     sourceName: string,
    //     assetName: string,
    //     appId: number,
    //     userInfo: any,
    //     limit: number = 5,
    //     offset: number = 0
    // ): Promise<[AssetWithSourceTypeName[], number]> {
    //     const orgId = userInfo['tenant_id'];
    //     const userId = userInfo['userId'];

    //     // Check tenant existence
    //     const count = await this.customerRepo.count({ where: { id: orgId } });
    //     if (!count) {
    //         throw new ForbiddenException({
    //             error: 'You are not linked to any organization.',
    //             message: 'You are not linked to any organization.',
    //         });
    //     }

    //     // Check user existence
    //     if (!userId) {
    //         throw new ForbiddenException({
    //             error: 'Please provide userId.',
    //             message: 'Please provide userId',
    //         });
    //     }

    //     // Get application IDs associated with the user
    //     const appIds: number[] = await this.getAppIds(userId, appId);

    //     // Build the where clause dynamically
    //     const whereClause: any = {
    //         is_deleted: false,
    //         app_id: In(appIds),
    //     };

    //     if (sourceName) {
    //         whereClause.source_type = sourceName;
    //     }
    //     if (assetName) {
    //         whereClause.name = assetName;
    //     }

    //     // Fetch assets with the provided conditions
    //     const [assets, total] = await this.assetRepo.findAndCount({
    //         where: whereClause,
    //         take: limit,
    //         skip: offset,
    //         select: [
    //             'id',
    //             'source_type_id',
    //             'source_version',
    //             'asset_id',
    //             'name',
    //             'llm_summary',
    //             'created_at',
    //             'updated_at',
    //             'customer_id',
    //             'app_id',
    //             'source_id'
    //         ]
    //     });

    //     // Fetch source type name for each asset and add it to the asset data
    //     for (const asset of assets) {
    //         if (asset.source_type_id) {
    //             // Fetch the source type
    //             const sourceType = await this.sourceTypeRepo.findOne({
    //                 where: { id: asset.source_type_id },
    //                 select: ['name']
    //             });

    //             // Fetch source data
    //             const sourceData = await this.sourceRepo.findOne({
    //                 where: { id: asset.source_id },
    //                 select: ['data']
    //             });

    //             // Extract resource type if sourceData is available
    //             const resourceType = sourceData?.data?.resourceType ?? null;

    //             // Assign source_type_name if both sourceType and resourceType are available
    //             (asset as AssetWithSourceTypeName).source_type_name = sourceType && resourceType
    //                 ? `${toTitleCase(sourceType.name)} (${resourceType})`
    //                 : null;
    //         }
    //     }

    //     function toTitleCase(str: string): string {
    //         return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    //     }


    //     return [assets as AssetWithSourceTypeName[], total];
    // }



    // Update asset by id
    async updateAsset(id: number, updateData: Partial<Asset>, userInfo: any): Promise<Asset | null> {
        const orgId = userInfo['tenant_id'];

        // Check if the user is linked to an organization
        const organizationExists = await this.customerRepo.count({ where: { id: orgId } });
        if (!organizationExists) {
            throw new ForbiddenException({
                error: 'Organization not linked',
                message: 'You are not linked to any organization. Please contact your administrator.',
            });
        }

        // Find the asset by id or throw NotFoundException
        const asset = await this.assetRepo.findOneOrFail({ where: { id } });

        // Merge the updateData into the found asset and save
        Object.assign(asset, updateData);
        return this.assetRepo.save(asset);
    }

    private async getAppIds(userId: string, appId?: number): Promise<number[]> {
        const appIds: number[] = appId ? [await this.checkAppAccess(appId, userId)] : await this.getUserApps(userId);
        return appIds;
    }

    private async checkAppAccess(appId: number, userId: string): Promise<number> {
        const user: User = await this.userRepo.findOneOrFail({
            where: { id: userId },
            select: ['role_id'],
        });

        if (UserRoles.getInternalRoles().includes(user.role_id)) {
            return appId;
        }

        const app = await this.appsRepo.findOneOrFail({
            where: { id: appId },
            relations: ['appUsers'],
        });

        this.verifyUserAccess(app.appUsers, userId);

        return appId;
    }

    private async getUserApps(userId: string): Promise<number[]> {
        const apps: App[] = await this.appsRepo.createQueryBuilder('app')
            .select('app.id')
            .innerJoin('app.appUsers', 'appUsers')
            .where('appUsers.user_id = :userId', { userId })
            .getMany();

        const appIds = apps.map(app => app.id);

        if (appIds.length === 0) {
            throw new ForbiddenException({
                error: 'You do not have permission to access these apps.',
                message: 'You do not have permission to access these apps.',
            });
        }

        return appIds;
    }

    private verifyUserAccess(appUsers: AppUser[], userId: string): void {
        const hasAccess = appUsers.some(appUser =>
            appUser.user_id === userId &&
            (appUser.role === AppUserRole.ADMIN || appUser.role === AppUserRole.OWNER)
        );

        if (!hasAccess) {
            throw new ForbiddenException({
                error: 'You do not have permission to access this app.',
                message: 'You do not have permission to access this app.',
            });
        }
    }

    async deleteAsset(userInfo: any, id: number): Promise<boolean> {
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
        const result = await this.assetRepo.update({ id }, { is_deleted: true });
        return result.affected > 0;
    }

}
