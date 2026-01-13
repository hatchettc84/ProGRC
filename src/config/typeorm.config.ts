import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { TypeOrmLoggerService } from "../logger/typeorm-logger.service";
import { TypeOrmLogger } from "src/logger/typeormLogger";

dotenv.config();

const commonConfig: PostgresConnectionOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [
    __dirname + "/../entities/*.entity{.ts,.js}",
    __dirname + "/../entities/assessments/*.entity{.ts,.js}",
    __dirname + "/../masterData/*.entity{.ts,.js}",
    __dirname + "/../entities/source/*.entity{.ts,.js}",
    __dirname + "/../entities/compliance/*.entity{.ts,.js}",
    __dirname + "/../entities/recommendation/*.entity{.ts,.js}",
    __dirname + "/../entities/connection/*.entity{.ts,.js}",
    __dirname + "/../entities/auth/*.entity{.ts,.js}",
  ],
  synchronize: false,
  logging: false,
  // logger: new TypeOrmLogger(new TypeOrmLoggerService()),
  extra: {
    ssl:
      process.env.POSTGRES_SSL === "false"
        ? false
        : { rejectUnauthorized: false },
  },
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  ...commonConfig,
};

export const dataSourceOptions: DataSourceOptions = {
  ...commonConfig,
  migrationsTransactionMode: "each",
  migrations: [
    __dirname + "/../migrations/*.ts",
    __dirname + "/../migrations/*.js",
  ],
};

export const dataSource = new DataSource(dataSourceOptions);
