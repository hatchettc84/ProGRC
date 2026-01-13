import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClusterAndActionToRecommendations1710612345678 implements MigrationInterface {
    name = 'AddClusterAndActionToRecommendations1710612345678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
        // Check if enum type exists before creating
        // const enumExists = await queryRunner.query(`
        //     SELECT EXISTS (
        //         SELECT 1 FROM pg_type 
        //         WHERE typname = 'application_control_recommendation_action_enum'
        //     );
        // `);

        // if (!enumExists[0].exists) {
        //     await queryRunner.query(`CREATE TYPE "public"."application_control_recommendation_action_enum" AS ENUM('ACCEPT', 'REJECT')`);
        // }
        
        // // Check if columns exist before adding them
        // const tableExists = await queryRunner.query(`
        //     SELECT EXISTS (
        //         SELECT 1 FROM information_schema.tables 
        //         WHERE table_name = 'application_control_recommendation'
        //     );
        // `);

        // if (tableExists[0].exists) {
        //     const clusterColumnExists = await queryRunner.query(`
        //         SELECT EXISTS (
        //             SELECT 1 FROM information_schema.columns 
        //             WHERE table_name = 'application_control_recommendation' 
        //             AND column_name = 'cluster'
        //         );
        //     `);

        //     const actionColumnExists = await queryRunner.query(`
        //         SELECT EXISTS (
        //             SELECT 1 FROM information_schema.columns 
        //             WHERE table_name = 'application_control_recommendation' 
        //             AND column_name = 'action'
        //         );
        //     `);

        //     if (!clusterColumnExists[0].exists) {
        //         await queryRunner.query(`ALTER TABLE "application_control_recommendation" ADD COLUMN "cluster" varchar NULL`);
        //     }

        //     if (!actionColumnExists[0].exists) {
        //         await queryRunner.query(`ALTER TABLE "application_control_recommendation" ADD COLUMN "action" "public"."application_control_recommendation_action_enum" NULL`);
        //     }
        // }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`select 1`);
        // Check if table exists before removing columns
        // const tableExists = await queryRunner.query(`
        //     SELECT EXISTS (
        //         SELECT 1 FROM information_schema.tables 
        //         WHERE table_name = 'application_control_recommendation'
        //     );
        // `);

        // if (tableExists[0].exists) {
        //     const clusterColumnExists = await queryRunner.query(`
        //         SELECT EXISTS (
        //             SELECT 1 FROM information_schema.columns 
        //             WHERE table_name = 'application_control_recommendation' 
        //             AND column_name = 'cluster'
        //         );
        //     `);

        //     const actionColumnExists = await queryRunner.query(`
        //         SELECT EXISTS (
        //             SELECT 1 FROM information_schema.columns 
        //             WHERE table_name = 'application_control_recommendation' 
        //             AND column_name = 'action'
        //         );
        //     `);

        //     if (actionColumnExists[0].exists) {
        //         await queryRunner.query(`ALTER TABLE "application_control_recommendation" DROP COLUMN "action"`);
        //     }

        //     if (clusterColumnExists[0].exists) {
        //         await queryRunner.query(`ALTER TABLE "application_control_recommendation" DROP COLUMN "cluster"`);
        //     }
        // }
        
        // // Check if enum type exists before dropping
        // const enumExists = await queryRunner.query(`
        //     SELECT EXISTS (
        //         SELECT 1 FROM pg_type 
        //         WHERE typname = 'application_control_recommendation_action_enum'
        //     );
        // `);

        // if (enumExists[0].exists) {
        //     await queryRunner.query(`DROP TYPE "public"."application_control_recommendation_action_enum"`);
        // }
    }
} 