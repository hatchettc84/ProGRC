import { Module } from "@nestjs/common";
import { ConnectionsController } from "./connections.controller";
import { ConnectionsService } from "./connections.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { LoggerService } from "src/logger/logger.service";
import { ApplicationConnection } from "src/entities/connection/applicationConnections.entity";
import { Lock } from "src/entities/lock.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationConnection, Lock]),
    AuthModule,
  ],
  controllers: [ConnectionsController],
  providers: [ConnectionsService, LoggerService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
