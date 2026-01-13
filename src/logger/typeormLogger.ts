import { Logger } from 'typeorm';
import { TypeOrmLoggerService } from './typeorm-logger.service';

export class TypeOrmLogger implements Logger {
    constructor(private readonly logger: TypeOrmLoggerService) {}

    logQuery(query: string, parameters?: any[]) {
        this.logger.logQuery(query, parameters);
    }

    logQueryError(error: string, query: string, parameters?: any[]) {
        this.logger.logQueryError(error, query, parameters);
    }

    logQuerySlow(time: number, query: string, parameters?: any[]) {
        this.logger.logQuerySlow(time, query, parameters);
    }

    logSchemaBuild(message: string) {
        this.logger.logSchemaBuild(message);
    }

    logMigration(message: string) {
        this.logger.logMigration(message);
    }

    log(level: 'log' | 'info' | 'warn', message: any) {
        this.logger.log(level, message);
    }
}