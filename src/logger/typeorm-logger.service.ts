import { Injectable } from "@nestjs/common";
import * as winston from "winston";
import "winston-daily-rotate-file";
import * as os from "os";

@Injectable()
export class TypeOrmLoggerService {
  private typeOrmLogger: winston.Logger;

  constructor() {
    const hostname = os.hostname();

    // Create JSON format for files
    const jsonFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format((info: winston.Logform.TransformableInfo) => {
        const baseInfo = {
          timestamp: info.timestamp,
          level: info.level,
          message: String(info.message),
          hostname,
          processId: process.pid,
          logger: "typeorm",
        };

        // Add additional fields if they exist
        if (info.meta) Object.assign(baseInfo, info.meta);
        if (info.stack) Object.assign(baseInfo, { stack: info.stack });
        if (info.error) Object.assign(baseInfo, { error: info.error });

        return baseInfo as winston.Logform.TransformableInfo;
      })(),
      winston.format.json()
    );

    // Create readable format for console
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(
        ({ timestamp, level, message, hostname, processId, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? `\n${JSON.stringify(meta, null, 2)}`
            : "";
          return `${timestamp} [${level}] [${hostname}:${processId}] [TypeORM]: ${message}${metaString}`;
        }
      )
    );
    const logsDir = process.env.LOGS_DIR || "/logs_bff";

    this.typeOrmLogger = winston.createLogger({
      level: "info",
      transports: [
        // Console transport with readable format
        // new winston.transports.Console({
        //     format: consoleFormat
        // }),
        // File transport with JSON format
        new winston.transports.DailyRotateFile({
          filename: `typeorm-${hostname}.log`,
          dirname: logsDir,
          datePattern: "",
          zippedArchive: true,
          maxSize: "30m",
          maxFiles: "30d",
          createSymlink: true,
          symlinkName: `typeorm-${hostname}.log`,
          format: jsonFormat,
        }),
        new winston.transports.DailyRotateFile({
          filename: `typeorm-error-${hostname}.log`,
          dirname: logsDir,
          datePattern: "",
          level: "error",
          zippedArchive: true,
          maxSize: "10m",
          maxFiles: "30d",
          createSymlink: true,
          symlinkName: `typeorm-error-${hostname}.log`,
          format: jsonFormat,
        }),
      ],
    });
  }

  logQuery(query: string, parameters?: any[]) {
    this.typeOrmLogger.info("Query executed", {
      query,
      parameters,
      type: "query",
    });
  }

  logQueryError(error: string, query: string, parameters?: any[]) {
    this.typeOrmLogger.error("Query error", {
      error,
      query,
      parameters,
      type: "query_error",
    });
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    this.typeOrmLogger.warn("Slow query detected", {
      executionTime: time,
      query,
      parameters,
      type: "slow_query",
    });
  }

  logSchemaBuild(message: string) {
    this.typeOrmLogger.info("Schema build", {
      message,
      type: "schema_build",
    });
  }

  logMigration(message: string) {
    this.typeOrmLogger.info("Migration", {
      message,
      type: "migration",
    });
  }

  log(level: "log" | "info" | "warn", message: any) {
    this.typeOrmLogger[level]("TypeORM log", {
      message,
      type: "general",
    });
  }
}
