import { forwardRef, MiddlewareConsumer, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppModule } from "src/app/app.module";
import { AuthModule } from "src/auth/auth.module";
import { CognitoService } from "src/auth/cognitoAuth.service";
import { App } from "src/entities/app.entity";
import { AppUser } from "src/entities/appUser.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { Customer } from "src/entities/customer.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { CustomerEvent } from "src/entities/customerEvent.entity";
import { ResetPasswordToken } from "src/entities/resetPasswordToken.entity";
import { User } from "src/entities/user.entity";
import { NotificationsModule } from "src/notifications/notifications.module";
import { ResetPasswordTokenService } from "src/user/services/resetPasswordToken.service";
import { CustomerController } from "./customer.controller";
import { EventController } from "./event/event.controller";
import { CreateEventService } from "./event/service/createEvent.service";
import { DeleteEventService } from "./event/service/deleteEvent.service";
import { GetEventService } from "./event/service/getEvent.service";
import { UpdateEventService } from "./event/service/updateEvent.service";
import { ImpersonationController } from "./impersonation.controller";
import { ResetPasswordService } from "./member/resetPassword.service";
import { UpdateMemberService } from "./member/updateMember.service";
import { AssignCustomerManagerService } from "./service/assignCsm.service";
import { DeleteCustomerService } from "./service/deleteCustomer.service";
import { ImpersonateService } from "./service/impersonate.service";
import { UpdateCustomerService } from "./service/updateCustomer.service";
import { DeleteUserService } from "src/user/services/deleteUser.service";
import { DeleteApplicationService } from "src/application/deleteApplication.service";
import { ApplicationPolicyService } from "src/application/applicationPolicy.service";
import { RequestMiddleware } from "src/middlewares/request.middleware";
import { LoggerService } from "src/logger/logger.service";
import { RequestContextService } from "src/request-context/request-context.service";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { SyncComplianceV2Service } from "src/compliance/service/syncComplianceV2.service";
import { JwtService } from "@nestjs/jwt";
import { AppStandard } from "src/entities/appStandard.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { ApplicationComplianceController } from "src/compliance/applicationCompliance.controller";
import { ApplicationControlMappingView } from "src/entities/compliance/applicationControlMappingView.entity";
import { AuditService } from "src/audit/audit/audit.service";
import { AuditFeedback } from "src/entities/auditFeedback.entity";
import { DomainCacheModule } from "src/cache/domain-cache.module";
import { Control } from "src/entities/compliance/control.entity";
import { AiHelperService } from "src/common/services/ai-helper.service";
import { GeminiService } from "src/llms/gemini.service";
import { GradientService } from "src/llms/gradient.service";
import { OpenAiService } from "src/llms/openAi.service";
import { OllamaService } from "src/llms/ollama.service";
import { HttpModule } from "@nestjs/axios";
import { EmailService } from "src/notifications/email.service";
import { LicenseRule } from "src/entities/licenseRule.entity";
import { LicenseType } from "src/entities/lincenseType.entity";
import { Permission } from "src/entities/permission.entity";
import { UserRole, UserRoles } from "src/masterData/userRoles.entity";
import { SESClient } from "@aws-sdk/client-ses";

@Module({
    controllers: [CustomerController, EventController, ImpersonationController],
    providers: [
        CognitoService,
        DeleteCustomerService,
        AssignCustomerManagerService,
        UpdateCustomerService,
        CreateEventService,
        GetEventService,
        UpdateEventService,
        DeleteEventService,
        ResetPasswordService,
        ImpersonateService,
        ResetPasswordTokenService,
        UpdateMemberService,
        DeleteUserService,
        DeleteApplicationService,
        ApplicationPolicyService, LoggerService, AwsS3ConfigService, JwtService,
        SyncComplianceV2Service, AuditService,
        AiHelperService,
        GeminiService,
        GradientService,
        OpenAiService,
        OllamaService,
        EmailService,
        SESClient
    ],
    imports: [
        TypeOrmModule.forFeature([
            Customer,
            User,
            CustomerCsm,
            CustomerEvent,
            ResetPasswordToken,
            App,
            AppUser,
            AsyncTask,
            SourceV1,
            SourceVersion,
            SourceChunkMapping,
            AppStandard,
            ApplicationControlMapping,
            StandardControlMapping, 
            ApplicationControlMappingView,
            AuditFeedback,
            Control,
            LicenseRule,
            LicenseType,
            Permission,
            UserRoles
        ]),
        forwardRef(() => AuthModule),
        NotificationsModule,
        forwardRef(() => AppModule),
        DomainCacheModule,
        HttpModule,
    ],
    exports: [
        DeleteApplicationService,
        ApplicationPolicyService,
    ]
})
export class CustomerModule { }
