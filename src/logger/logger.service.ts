import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import * as winston from "winston";
import "winston-daily-rotate-file";
import * as os from "os";

@Injectable()
export class LoggerService implements NestLoggerService {
  private appLogger: winston.Logger;

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
      winston.format((info: winston.Logform.TransformableInfo) => {
        info.hostname = hostname;
        info.processId = process.pid;
        return info;
      })(),
      winston.format.printf(
        ({ timestamp, level, message, hostname, processId, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? `\n${JSON.stringify(meta, null, 2)}`
            : "";
          return `${timestamp} [${level}] [${hostname}:${processId}]: ${message}${metaString}`;
        }
      )
    );
    const logsDir = process.env.LOGS_DIR || "/logs_bff";

    this.appLogger = winston.createLogger({
      level: "info",
      transports: [
        // Console transport with readable format
        new winston.transports.Console({
          format: consoleFormat,
        }),
        // File transport with JSON format
        new winston.transports.DailyRotateFile({
          filename: `application-${hostname}.log`,
          dirname: logsDir,
          datePattern: "",
          zippedArchive: true,
          maxSize: "30m",
          maxFiles: "30d",
          createSymlink: true,
          symlinkName: `application-${hostname}.log`,
          format: jsonFormat,
        }),
        new winston.transports.DailyRotateFile({
          filename: `error-${hostname}.log`,
          dirname: logsDir,
          datePattern: "",
          level: "error",
          zippedArchive: true,
          maxSize: "10m",
          maxFiles: "30d",
          createSymlink: true,
          symlinkName: `error-${hostname}.log`,
          format: jsonFormat,
        }),
      ],
    });
  }

  error(message: string, ...meta: any[]) {
    this.appLogger.error(message, { meta });
  }

  warn(message: string, ...meta: any[]) {
    this.appLogger.warn(message, { meta });
  }

  info(message: string, ...meta: any[]) {
    this.appLogger.info(message, { meta });
  }

  log(message: string, ...meta: any[]) {
    this.appLogger.info(message, { meta });
  }

  debug(message: string, ...meta: any[]) {
    this.appLogger.debug(message, { meta });
  }

  trace(message: string, ...meta: any[]) {
    this.appLogger.verbose(message, { meta });
  }
}
