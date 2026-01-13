import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterSourceTextChanges1740389097754 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = "source_version";
        const columnsToAdd = [
          { name: "text_version", type: "int", isNullable: true  },
          { name: "text_s3_path", type: "varchar(255)", isNullable: true },
          // { name: "is_latest", type: "boolean", default: false },
          { name: "text_config", type: "varchar(255)", isNullable: true  },
          { name: "text_created_at", type: "date", isNullable: true },
          { name: "text_updated_at", type: "date", isNullable: true },
          { name: "is_text_available", type: "boolean", default: false }
        ];
    
        for (const column of columnsToAdd) {
          const hasColumn = await queryRunner.hasColumn(table, column.name);
          if (!hasColumn) {
            await queryRunner.addColumn(table, new TableColumn(column));
          }
        }

        // mark all existing sources as latest
        // await queryRunner.query(`UPDATE source SET is_latest = true`);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        const table = "source_version";
        const columnNames = [
          "text_version",
          "text_s3_path",
          // "is_latest",
          "text_config",
          "text_created_at", 
          "text_updated_at", 
          "is_text_available"
        ];
    
        for (const columnName of columnNames) {
          const hasColumn = await queryRunner.hasColumn(table, columnName);
          if (hasColumn) {
            await queryRunner.dropColumn(table, columnName);
          }
        }
      }

}
