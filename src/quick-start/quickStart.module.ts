import { Module } from '@nestjs/common';
import { QuickStartService } from './quickStart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckList } from 'src/entities/quickStart.entity';
import { QuickStartController } from './quickStart.controller';
import { AuthService } from 'src/auth/auth.service';
import { CognitoService } from 'src/auth/cognitoAuth.service';
import { AWSJWKSSyncCron } from 'src/auth/awsJwksSyncCron';
import { RoleHierarchyService } from 'src/auth/roleHierarchy.service';
import { LoggerService } from 'src/logger/logger.service';
import { User } from 'src/entities/user.entity';
import { Customer } from 'src/entities/customer.entity';
import { EmailService } from 'src/notifications/email.service';
import { ResetPasswordTokenService } from 'src/user/services/resetPasswordToken.service';
import { CustomerCsm } from 'src/entities/customerCsm.entity';
import { SESClient } from '@aws-sdk/client-ses';
import { ResetPasswordToken } from 'src/entities/resetPasswordToken.entity';
import { LicenseRule } from 'src/entities/licenseRule.entity';
import { LicenseType } from 'src/entities/lincenseType.entity';
import { PermissionValidatorService } from 'src/auth/permissionValidator.service';
import { DomainCacheModule } from 'src/cache/domain-cache.module';
import { Permission } from 'src/entities/permission.entity';
import { UserRoles } from 'src/masterData/userRoles.entity';
import { PasswordHistory } from 'src/entities/auth/passwordHistory.entity';
import { RefreshToken } from 'src/entities/auth/refreshToken.entity';
@Module({
    providers: [QuickStartService, CognitoService, AuthService, AWSJWKSSyncCron, RoleHierarchyService, LoggerService, EmailService, ResetPasswordTokenService, SESClient, PermissionValidatorService],
    exports: [QuickStartService],
      controllers: [QuickStartController],
    
     imports: [
        TypeOrmModule.forFeature([
          CheckList,
          User,
          Customer,
          CustomerCsm,
          ResetPasswordToken,
          LicenseType,
          LicenseRule,
          Permission,
          UserRoles,
          PasswordHistory,
          RefreshToken
        ]),
        DomainCacheModule
      ]
  })
export class QuickStartModule {}
