import { forwardRef, MiddlewareConsumer, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { TrustCenter } from "src/entities/trustCenter.entity";
import { DeleteTrustCenterService } from "./service/deleteTrustCenter.service";
import { GetTrustCenterService } from "./service/getTrustCenter.service";
import { UpdateTrustCenterService } from "./service/updateTrustCenter.service";
import { TrustCenterController } from "./trustCenter.controller";
import { LoggerService } from "src/logger/logger.service";
import { RequestContextService } from "src/request-context/request-context.service";
import { RequestMiddleware } from "src/middlewares/request.middleware";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TrustCenter
        ]),
        forwardRef(() => AuthModule),
    ],
    controllers: [TrustCenterController],
    providers: [
        GetTrustCenterService,
        UpdateTrustCenterService,
        DeleteTrustCenterService, LoggerService, RequestContextService
    ]
})
export class TrustCenterModule { }
