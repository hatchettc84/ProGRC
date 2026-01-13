import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AppStandard } from "src/entities/appStandard.entity";
import { AsyncTask, TaskOps, TaskStatus } from "src/entities/asyncTasks.entity";
import { SourceAsset } from "src/entities/source/applicationSourceType.entity";
import { Asset } from "src/entities/source/assets.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { DataSource, EntityManager, Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CreateDummyAssetService {
    constructor(
        @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
        @InjectRepository(SourceAsset) private readonly sourceAssetRepository: Repository<SourceAsset>,
        @InjectRepository(AppStandard) private readonly appStandardRepo: Repository<AppStandard>,
        private readonly dataSource: DataSource,
    ) { }

    async createDummyAsset(appId, sourceTypeId, customerId, sourceId) {
        await this.dataSource.transaction(async (manager) => {
            let sourceAsset = await manager.findOne(SourceAsset, { where: { app_id: appId } });
            if (!sourceAsset) {
                sourceAsset = this.sourceAssetRepository.create({
                    customer_id: customerId,
                    source_type: sourceTypeId,
                    app_id: appId,
                    assets_count: 0,
                    source_count: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            }

            const numAssets = Math.floor(Math.random() * (8 - 3 + 1)) + 3;

            for (let i = 0; i < numAssets; i++) {
                await this.generateAsset(manager, appId, sourceTypeId, customerId, sourceId);
            }

            sourceAsset.assets_count = numAssets;
            await manager.save(sourceAsset);
            await manager.update(AsyncTask, { app_id: appId, ops: TaskOps.CREATE_ASSETS, status: TaskStatus.PENDING }, { status: TaskStatus.PROCESSED });
            await this.appStandardRepo.update({ app_id: appId }, { have_pending_compliance: true });
        });
    }

    private async generateAsset(manager: EntityManager, appId, sourceTypeId, customerId, sourceId) {
        const source: SourceV1 = await manager.findOne(SourceV1, { where: { id: sourceId, app_id: appId } });
        const asset = this.assetRepository.create({
            source_type_id: sourceTypeId,
            source_version: source.current_version,
            llm_summary: this.getRandomAssetSummary(),
            name: this.getRandomAssetName(),
            asset_id: uuidv4(),
            customer_id: customerId,
            source_id: source.id,
            created_at: new Date(),
            updated_at: new Date(),
            app_id: appId,
        });

        await manager.save(asset);
    }

    private getRandomAssetName(): string {
        const assetNames = [
            'AWS::EC2::Instance',
            'AWS::ECS::Cluster',
            'AWS::RDS::DBInstance',
            'AWS::S3::Bucket',
            'AWS::CloudFront::Distribution',
            'AWS::NetworkFirewall::Firewall',
            'AWS::WAFv2::WebACL',
            'AWS::CloudWatch::Alarm'
        ];
        return assetNames[Math.floor(Math.random() * assetNames.length)];
    }

    private getRandomAssetSummary(): string {
        const assetSummaries = [
            JSON.stringify({ "instance_type": "m5.large", "state": "running", "private_ip": this.getRandomIp(), "vpc_id": uuidv4(), "security_group": uuidv4() }),
            JSON.stringify({ "cluster_name": "ApplicationCluster", "status": "ACTIVE", "desired_tasks": 4, "launch_type": "FARGATE" }),
            JSON.stringify({ "db_engine": "postgres", "instance_class": "db.r5.large", "multi_az": true, "endpoint": this.getRandomUrl() }),
            JSON.stringify({ "bucket_name": this.getRandomDomain(), "encryption": "aws:kms", "lifecycle": "GLACIER after 30 days" }),
            JSON.stringify({ "domain_name": this.getRandomDomain(), "status": "Deployed", "origin": this.getRandomUrl() }),
            JSON.stringify({ "firewall_name": "EnterpriseNetworkFirewall", "vpc_id": uuidv4(), "subnets": [uuidv4(), uuidv4()] }),
            JSON.stringify({ "name": "WAF-Web-ACL", "scope": "CLOUDFRONT", "default_action": "allow", "rule": "SQLInjectionProtection" }),
            JSON.stringify({ "alarm_name": "HighCPUUsageAlarm", "metric": "CPUUtilization", "threshold": 80.0, "evaluation_periods": 1 })
        ];
        return assetSummaries[Math.floor(Math.random() * assetSummaries.length)];
    }

    private getRandomIp(): string {
        return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    }

    private getRandomUrl(): string {
        return `https://example.com/${Math.random().toString(36).substring(7)}`;
    }

    private getRandomDomain(): string {
        return `${Math.random().toString(36).substring(7)}.com`;
    }

    async createDummyAsse_v2(appId, sourceTypeId, customerId, sourceId) {
        await this.dataSource.transaction(async (manager) => {
            let sourceAsset = await manager.findOne(SourceAsset, { where: { app_id: appId } });
            if (!sourceAsset) {
                sourceAsset = this.sourceAssetRepository.create({
                    customer_id: customerId,
                    source_type: sourceTypeId,
                    app_id: appId,
                    assets_count: 0,
                    source_count: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            }

            const numAssets = Math.floor(Math.random() * (8 - 3 + 1)) + 3;

            for (let i = 0; i < numAssets; i++) {
                await this.generateAsset_v2(manager, appId, sourceTypeId, customerId, sourceId);
            }

            sourceAsset.assets_count = numAssets;
            await manager.save(sourceAsset);
            // Update task by entity_id to be more specific - update the task for this specific source
            // Note: entity_id is stored as string in the database
            await manager.update(AsyncTask, { app_id: appId, ops: TaskOps.CREATE_ASSETS, status: TaskStatus.PENDING, entity_id: sourceId.toString() }, { status: TaskStatus.PROCESSED });
            await this.appStandardRepo.update({ app_id: appId }, { have_pending_compliance: true });
        });
    }
    private async generateAsset_v2(manager: EntityManager, appId, sourceTypeId, customerId, sourceId) {
        const source: SourceV1 = await manager.findOne(SourceV1, { where: { id: sourceId, app_id: appId } });
        const asset = this.assetRepository.create({
            source_type_id: sourceTypeId,
            source_version: source.current_version || 1,
            llm_summary: this.getRandomAssetSummary(),
            name: this.getRandomAssetName(),
            asset_id: uuidv4(),
            customer_id: customerId,
            source_id: source.id,
            created_at: new Date(),
            updated_at: new Date(),
            app_id: appId,
        });

        await manager.save(asset);
    }
}
