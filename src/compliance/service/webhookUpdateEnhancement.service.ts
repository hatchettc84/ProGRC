// import { Injectable } from "@nestjs/common";
// import { Asset } from "src/entities/source/assets.entity";
// import { DataSource, EntityManager, Like } from "typeorm";
// import { WebhookRequest } from "../controlDetails.dto";
// import { AppStandardControlService } from "./appStandardControl.service";
// import { LoggerService } from "src/logger/logger.service";

// interface EnhancementResult {
//     enhancementid: string;
//     controlid: string;
// }

// interface EnhancementUpdateData {
//     status: string;
//     implementation: string;
//     percentage_completion: number;
//     updated_at: Date;
// }

// @Injectable()
// export class WEbhookUpdateEnhancementService extends AppStandardControlService {
//     constructor(
//         private readonly dataSource: DataSource,
//         private readonly logger: LoggerService
//     ) {
//         super();
//     }

//     async updateEnhancement(requests: WebhookRequest[]): Promise<void> {
//         const transactionPromises = requests.map(request =>
//             this.processEnhancementRequest(request)
//         );

//         await Promise.all(transactionPromises);
//     }

//     private async processEnhancementRequest(request: WebhookRequest): Promise<void> {
//         return this.dataSource.transaction(async manager => {
//             const enhancement = await this.findEnhancement(manager, request);

//             if (!enhancement) {
//                 this.logEnhancementNotFound(request);
//                 return;
//             }

//             await this.executeEnhancementUpdates(manager, request, enhancement);
//         });
//     }

//     private async findEnhancement(
//         manager: EntityManager,
//         request: WebhookRequest
//     ): Promise<ComplianceControlEnhancement | null> {
//         const controlEnhancementPattern = this.buildEnhancementPattern(request.control_enhancement_id);
//         return await manager.findOne(ComplianceControlEnhancement, {
//             where: {
//                 app_id: parseInt(request.app_id),
//                 standard_control_enhancement: { name: Like(controlEnhancementPattern) }
//             },
//             relations: ['standard_control_enhancement']
//         });
//     }

//     private async executeEnhancementUpdates(
//         manager: EntityManager,
//         request: WebhookRequest,
//         enhancement: ComplianceControlEnhancement
//     ): Promise<void> {
//         const updateData = this.prepareUpdateData(request);
//         await this.updateEnhancementStatus(manager, enhancement.id, updateData);
//         const updatePromises = [
//             this.recalculateControlCompletion(manager, enhancement.compliance_control_id),
//             this.insertAssetControls(manager, request.asset_ids, enhancement)
//         ];

//         await Promise.all(updatePromises);
//         await this.recalculateAsset(manager, enhancement.app_id);
//     }

//     private async updateEnhancementStatus(
//         manager: EntityManager,
//         enhancementId: number,
//         updateData: EnhancementUpdateData
//     ): Promise<void> {
//         await manager.update(
//             ComplianceControlEnhancement,
//             { id: enhancementId },
//             updateData
//         );
//     }

//     private async insertAssetControls(
//         manager: EntityManager,
//         assetIds: string[],
//         enhancement: ComplianceControlEnhancement
//     ): Promise<void> {
//         const insertPromises = assetIds.map(async externalAssetId => {
//             const asset: Asset = await manager.findOne(Asset, { where: { asset_id: externalAssetId } });

//             manager.query(`
//                     INSERT INTO compliance_assets (
//                         app_id,
//                         customer_id,
//                         standard_id,
//                         standard_control_id,
//                         compliance_id,
//                         compliance_control_id, 
//                         compliance_control_enhancement_id, 
//                         asset_id
//                     ) 
//                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
//                     ON CONFLICT DO NOTHING
//                 `, [enhancement.app_id,
//             enhancement.customer_id,
//             enhancement.standard_id,
//             enhancement.standard_control_id,
//             enhancement.compliance_id,
//             enhancement.compliance_control_id,
//             enhancement.id,
//             asset.id]);
//         });

//         await Promise.all(insertPromises);
//     }

//     private buildEnhancementPattern(controlEnhancementId: string): string {
//         const firstPart = controlEnhancementId.split(' ')[0].toUpperCase();
//         return `${firstPart}%`;
//     }

//     private prepareUpdateData(request: WebhookRequest): EnhancementUpdateData {
//         return {
//             status: request.implementation_status,
//             implementation: request.implementation_explanation,
//             percentage_completion: ComplianceControlEnhancement.getPercentageCompletion(
//                 request.implementation_status
//             ),
//             updated_at: new Date()
//         };
//     }

//     private logEnhancementNotFound(request: WebhookRequest): void {
//         this.logger.warn(
//             `No enhancements found for app_id: ${request.app_id} and ` +
//             `control_enhancement_id: ${request.control_enhancement_id}`
//         );
//     }
// }
