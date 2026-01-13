// import { Injectable } from "@nestjs/common";
// import { ComplianceControl } from "src/entities/compliance/complianceControl.entity";
// // import { AppStandardControl } from "src/entities/compliance/appStandardControl.entity";
// import { DataSource, Repository } from "typeorm";

// @Injectable()
// export class ControlDetailsRepository extends Repository<ComplianceControl> {
//     constructor(private dataSource: DataSource) {
//         super(ComplianceControl, dataSource.createEntityManager());
//     }

//     async totalControlCategory(appId: number, standardId: number): Promise<number> {
//         const query = `
//             SELECT COUNT(DISTINCT scc.name) as count
//             FROM app_standard_controls app_sc
//             JOIN standard_controls sc ON app_sc.standard_control_id = sc.id
//             JOIN standard_control_categories scc ON sc.standard_control_category_id = scc.id
//             WHERE app_sc.app_id = $1 AND app_sc.standard_id = $2
//         `;
//         const result = await this.query(query, [appId, standardId]);
//         return +result[0].count;
//     }

//     async fetchAppStandardControlDetails(appId: number, standardId: number, limit: number, offset: number) {
//         const query = `
//             SELECT 
//                 app_sc.id AS appStandardControlId,
//                 app_sc.percentage_completion AS percentageCompletion,
//                 sc.name AS standardControlName,
//                 scc.name AS categoryName,
//                 COALESCE(app_sc.risk_levels, sc.risk_levels) AS riskLevels,
//                 (SELECT COUNT(1) 
//                     FROM app_standard_control_enhancements asce 
//                     WHERE asce.app_standard_control_id = app_sc.id) AS enhancementsCount
//             FROM (
//                 SELECT DISTINCT scc.name, scc.order_index
//                 FROM app_standard_controls app_sc
//                 LEFT JOIN standard_controls sc ON app_sc.standard_control_id = sc.id
//                 LEFT JOIN standard_control_categories scc ON sc.standard_control_category_id = scc.id
//                 WHERE app_sc.app_id = $1 AND app_sc.standard_id = $2
//                 ORDER BY scc.order_index ASC
//                 LIMIT $3 OFFSET $4
//             ) AS paginated_categories
//             JOIN standard_control_categories scc ON scc.name = paginated_categories.name
//             JOIN standard_controls sc ON sc.standard_control_category_id = scc.id
//             JOIN app_standard_controls app_sc ON app_sc.standard_control_id = sc.id
//             WHERE 
//                 app_sc.app_id = $1 
//                 AND app_sc.standard_id = $2
//             ORDER BY 
//                 scc.order_index ASC, 
//                 sc.order_index ASC
//         `;
//         return this.query(query, [appId, standardId, limit, offset]);
//     }
// }
