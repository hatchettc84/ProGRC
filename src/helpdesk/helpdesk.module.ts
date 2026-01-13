import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { Customer } from "src/entities/customer.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { NotificationsModule } from "src/notifications/notifications.module";
import { HelpdeskController } from "./helpdesk.controller";
import { ContactService } from "./service/contact.service";
import { LoggerService } from "src/logger/logger.service";
import { RequestContextService } from "src/request-context/request-context.service";

@Module({
    imports: [
        NotificationsModule,
        TypeOrmModule.forFeature([
            CustomerCsm,
            Customer,
        ]),
        forwardRef(() => AuthModule)
    ],
    controllers: [HelpdeskController],
    providers: [
        ContactService,
        LoggerService, RequestContextService
    ]
})

export class HelpdeskModule {}
