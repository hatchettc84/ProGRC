import { Logger, QueryRunner } from 'typeorm';

class NoOpLogger implements Logger {
    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        // Custom logging logic for queries
    }

    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        // Custom logging logic for query errors
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        // Custom logging for slow queries
    }

    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    }

    logMigration(message: string, queryRunner?: QueryRunner) {
    }

    log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    }
}

export { NoOpLogger };
