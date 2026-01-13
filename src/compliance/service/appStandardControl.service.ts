// import { Injectable } from "@nestjs/common";
// import { EntityManager } from "typeorm";

// @Injectable()
// export class AppStandardControlService {
//     constructor(
//     ) { }

//     protected async recalculateControlCompletion(manager: EntityManager, controlId: number): Promise<void> {
//         const percentage = await manager
//             .createQueryBuilder()
//             .select("AVG(compliance_control_enhancements.percentage_completion)", "average")
//             .from("compliance_control_enhancements", "compliance_control_enhancements")
//             .where("compliance_control_enhancements.compliance_control_id = :controlId", { controlId })
//             .andWhere("compliance_control_enhancements.status != :status", { status: 'not_applicable' })
//             .getRawOne();

//         // if the control has no enhancements, then the percentage will be null, dont calculate upper levels
//         if (!percentage.average) {
//             return;
//         }

//         const percentageCompliance = await manager
//             .createQueryBuilder()
//             .select("AVG(compliance_controls.percentage_completion)", "average")
//             .from("compliance_controls", "compliance_controls")
//             .where("compliance_controls.compliance_category_id = :categoryId", { categoryId: control.compliance_category_id })
//             .getRawOne();

//         await manager.update(ComplianceCategory, { id: control.compliance_category_id }, { percentage_completion: parseFloat(percentageCompliance.average), updated_at: new Date() });

//         const percentageCategory = await manager
//             .createQueryBuilder()
//             .select("AVG(compliance_categories.percentage_completion)", "average")
//             .from("compliance_categories", "compliance_categories")
//             .where("compliance_categories.compliance_id = :complianceId", { complianceId: control.compliance_id })
//             .getRawOne();

//         await manager.update(Compliance, { id: control.compliance_id }, { percentage_completion: parseFloat(percentageCategory.average), updated_at: new Date() });
//     }

//     protected async recalculateAsset(manager: EntityManager, appId: number): Promise<void> {
//         const countAssetComplianceControlEnhancment = `
//         UPDATE compliance_control_enhancements cce
//         SET asset_count = (
//             SELECT COUNT(*)
//             FROM compliance_assets ca
//             WHERE ca.compliance_control_enhancement_id = cce.id
//         ),
//         updated_at = $2
//             WHERE cce.app_id = $1;
//         `;

//         await manager.query(countAssetComplianceControlEnhancment, [appId, new Date()]);

//         const countAssetComplianceControl = `
//         UPDATE compliance_controls cc
//         SET asset_count = (
//             SELECT COUNT(DISTINCT ca.asset_id)
//             FROM compliance_assets ca
//             WHERE cc.id = ca.compliance_control_id
//         ),
//         updated_at = $2
//             WHERE cc.app_id = $1 AND cc.enhancement_count > 0;
//         `
//         await manager.query(countAssetComplianceControl, [appId, new Date()]);

//         const countAssetCompliance = `
//         UPDATE compliances c
//         SET asset_count = (
//             SELECT COUNT(DISTINCT ca.asset_id)
//             FROM compliance_assets ca
//             WHERE ca.compliance_id = c.id
//         ),
//         updated_at = $2
//             WHERE c.app_id = $1;
//         `
//         await manager.query(countAssetCompliance, [appId, new Date()]);
//     }
// }
