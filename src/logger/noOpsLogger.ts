import { Logger, QueryRunner } from "typeorm";

export class NoOpLogger implements Logger {
    // Do nothing for all log methods to suppress output
    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        // No-op: suppress query logging
    }

    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        // You can log errors if needed, or leave it as no-op to suppress errors as well
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        // No-op: suppress slow query logging
    }

    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        // No-op: suppress schema building logs
    }

    logMigration(message: string, queryRunner?: QueryRunner) {
        // No-op: suppress migration logs
    }

    log(level: "log" | "info" | "warn", message: any, queryRunner?: QueryRunner) {
        // No-op: suppress all logs
    }
}