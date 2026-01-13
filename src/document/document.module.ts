import { MiddlewareConsumer, Module } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { DocumentController } from "./document.controller";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { SspModule } from "src/ssp/ssp.module";
import { RequestMiddleware } from "src/middlewares/request.middleware";
import { LoggerService } from "src/logger/logger.service";
import { RequestContextService } from "src/request-context/request-context.service";

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, LoggerService, ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    SspModule,
    TypeOrmModule.forFeature([]),
  ],
})
export class DocumentModule {}
