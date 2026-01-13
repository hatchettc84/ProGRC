import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { App } from "src/entities/app.entity";
import { Customer } from "src/entities/customer.entity";
import { Asset } from "src/entities/source/assets.entity";
import { DataSource, Repository } from "typeorm";
import { AssetDto } from "./assets.dto";

@Injectable()
export class AssetsWebhookService {

    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
        @InjectRepository(App) private readonly appsRepo: Repository<App>,
        @InjectRepository(Asset) private readonly assetsRepo: Repository<Asset>,
    ) { }


    async createOrUpdateAsset(request: AssetDto): Promise<{ message: string }> {
        const orgId = request.customer_id;
        const appId = parseInt(request.app_id);
        const assetId = request.asset_id;

        if (!orgId) {
            throw new ForbiddenException({
                error: 'Organization ID missing in request.',
                message: 'Invalid organization ID in request.',
            });
        }

        // Check if the tenant organization exists
        const orgExists = await this.customerRepo.count({ where: { id: orgId } });
        if (!orgExists) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        const appExists = await this.appsRepo.count({ where: { id: appId } });
        if (!appExists) {
            throw new ForbiddenException({
                error: 'Please provide a valid appId.',
                message: 'Please provide a valid appId.',
            });
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if an asset with the specified keys exists
            let existingAsset = await this.assetsRepo.findOne({
                where: {
                    customer_id: orgId,
                    asset_id: assetId,
                    app_id: appId,
                },
            });

            if (existingAsset) {
                // Update the existing asset with new data
                existingAsset = {
                    ...existingAsset,
                    source_type_id: parseInt(request.source_type_id),
                    source_version: parseInt(request.source_version),
                    name: request.asset_name,
                    llm_summary: request.asset_summary,
                    llm_embeddings_small: request.embeddings_small,
                    llm_embeddings_large: request.embeddings_large,
                    updated_at: new Date(),
                    source_id: parseInt(request.source_id),
                };
                await queryRunner.manager.save(existingAsset);
            } else {
                // Create a new asset entry
                const newAsset = this.assetsRepo.create({
                    source_type_id: parseInt(request.source_type_id),
                    source_version: parseInt(request.source_version),
                    asset_id: assetId,
                    name: request.asset_name,
                    llm_summary: request.asset_summary,
                    llm_embeddings_small: request.embeddings_small,
                    llm_embeddings_large: request.embeddings_large,
                    created_at: new Date(),
                    updated_at: new Date(),
                    customer_id: orgId,
                    app_id: appId,
                    source_id: parseInt(request.source_id),
                });
                await queryRunner.manager.save(newAsset);
            }

            // Commit the transaction
            await queryRunner.commitTransaction();

            return {
                message: 'Asset upserted successfully.',
            };
        } catch (error) {
            // Roll back the transaction in case of an error
            await queryRunner.rollbackTransaction();
            throw new Error('Failed to upsert asset.');
        } finally {
            // Release the query runner
            await queryRunner.release();
        }
    }


}
