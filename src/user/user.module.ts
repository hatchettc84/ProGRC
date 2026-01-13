import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppModule } from "src/app/app.module";
import { AuthModule } from "src/auth/auth.module";
import { CustomerModule } from "src/customer/customer.module";
import { CognitoService } from "src/auth/cognitoAuth.service";
import { ResetPasswordService } from "src/customer/member/resetPassword.service";
import { ResetPasswordToken } from "src/entities/resetPasswordToken.entity";
import { User } from "src/entities/user.entity";
import { NotificationsModule } from "src/notifications/notifications.module";
import { CreateProGrcUserService } from "./services/createUser.service";
import { DeleteUserService } from "./services/deleteUser.service";
import { GetUserService } from "./services/getUser.service";
import { ResetInternalUserPassword } from "./services/resetPassword.service";
import { ResetPasswordTokenService } from "./services/resetPasswordToken.service";
import { UserController } from "./user.controller";
import { Customer } from "src/entities/customer.entity";
import { App } from "src/entities/app.entity";
import { DeleteApplicationService } from "src/application/deleteApplication.service";
import { LoggerService } from "src/logger/logger.service";
import { RequestContextService } from "src/request-context/request-context.service";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { DomainCacheModule } from "src/cache/domain-cache.module";
import { UserRoles } from "src/masterData/userRoles.entity";
import { LicenseRule } from "src/entities/licenseRule.entity";
import { Permission } from "src/entities/permission.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { AppUser } from "src/entities/appUser.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            ResetPasswordToken,
            App,
            Customer,
            UserRoles,
            LicenseRule,
            Permission,
            CustomerCsm, AppUser
        ]),
        forwardRef(() => AuthModule),
        NotificationsModule,
        forwardRef(() => AppModule),
        forwardRef(() => CustomerModule), // Add CustomerModule here
        DomainCacheModule
    ],
    controllers: [UserController],
    providers: [
        CreateProGrcUserService,
        GetUserService,
        CognitoService,
        DeleteUserService,
        ResetInternalUserPassword,
        ResetPasswordTokenService,
        ResetPasswordService,
        DeleteApplicationService, LoggerService, RequestContextService, AwsS3ConfigService
    ],
    exports: [
        ResetPasswordTokenService
    ],
})
export class UserModule { }
