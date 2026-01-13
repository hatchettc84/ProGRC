import { MiddlewareConsumer, Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { CustomerCsm } from 'src/entities/customerCsm.entity';
import { ResetPasswordToken } from 'src/entities/resetPasswordToken.entity';
import { User } from 'src/entities/user.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ChangePasswordService } from 'src/user/services/changePassword.service';
import { ResetPasswordTokenService } from 'src/user/services/resetPasswordToken.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AWSJWKSSyncCron } from './awsJwksSyncCron';
import { CognitoService } from './cognitoAuth.service';
import { EmailValidationService } from './emailValidation.service';
import { ResetPasswordController } from './resetPassword.controller';
import { RoleHierarchyService } from './roleHierarchy.service';
import { LoggerService } from 'src/logger/logger.service';
import { LicenseType } from 'src/entities/lincenseType.entity';
import { LicenseRule } from 'src/entities/licenseRule.entity';
import { CacheModule } from '../common/services/cache';
import { PermissionValidatorService } from './permissionValidator.service';
import { Permission } from 'src/entities/permission.entity';
import { UserRoles } from 'src/masterData/userRoles.entity';
import { ResetPasswordService } from 'src/customer/member/resetPassword.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordHistory } from 'src/entities/auth/passwordHistory.entity';
import { RefreshToken } from 'src/entities/auth/refreshToken.entity';
import { MfaDevice } from 'src/entities/auth/mfaDevice.entity';
import { EmailOtp } from 'src/entities/auth/emailOtp.entity';
import { MfaBackupCode } from 'src/entities/auth/mfaBackupCode.entity';
import { MfaSetupSession } from 'src/entities/auth/mfaSetupSession.entity';
import { SecurityPolicy } from 'src/entities/auth/securityPolicy.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { MfaStrategy } from './strategies/mfa.strategy';
import { Organization } from '../entities/organization.entity';
import { JwtAuthService } from './services/jwt-auth.service';
import { MfaService } from './services/mfa.service';
import { SecurityPolicyService } from './services/securityPolicy.service';
import { JwtAuthController } from './controllers/jwt-auth.controller';
import { MfaController } from './controllers/mfa.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResetInternalUserPassword } from 'src/user/services/resetPassword.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { MfaAuthGuard } from './guards/mfa-auth.guard';
import { MfaOrJwtAuthGuard } from './guards/mfa-or-jwt-auth.guard';
import { DomainCacheService } from 'src/cache/domain-cache.service';
import { PlatformOneService } from './services/platform-one.service';
import { PlatformOneController } from './controllers/platform-one.controller';
import { GameWardenJwtService } from './services/game-warden-jwt.service';
import { GameWardenAuthGuard } from './guards/game-warden-auth.guard';
import { GameWardenController } from './controllers/game-warden.controller';

@Module({
  providers: [
    CognitoService, 
    AuthService, 
    AWSJWKSSyncCron, 
    EmailValidationService, 
    RoleHierarchyService, 
    ResetPasswordTokenService, 
    ChangePasswordService, 
    LoggerService, 
    PermissionValidatorService, 
    ResetPasswordService, 
    JwtStrategy, 
    JwtRefreshStrategy,
    LocalStrategy, 
    MfaStrategy, 
    JwtAuthService, 
    MfaService,
    SecurityPolicyService,
    JwtAuthGuard, 
    ResetInternalUserPassword, 
    JwtRefreshGuard,
    JwtService,
    MfaAuthGuard,
    MfaOrJwtAuthGuard,
    DomainCacheService,
    PlatformOneService,
    GameWardenJwtService,
    GameWardenAuthGuard
  ],
  exports: [
    AuthService, 
    RoleHierarchyService, 
    PermissionValidatorService, 
    JwtAuthService, 
    MfaService,
    SecurityPolicyService,
    JwtAuthGuard, 
    JwtRefreshGuard,
    MfaAuthGuard,
    MfaOrJwtAuthGuard,
    PlatformOneService,
    GameWardenJwtService,
    GameWardenAuthGuard
  ],
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      Customer,
      CustomerCsm,
      ResetPasswordToken,
      LicenseType,
      LicenseRule,
      Permission,
      UserRoles,
      PasswordHistory,
      RefreshToken,
      MfaDevice,
      EmailOtp,
      MfaBackupCode,
      MfaSetupSession,
      SecurityPolicy,
      Organization, 
    ]),
    CacheModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('CACHE_TYPE', 'memory') as 'memory' | 'redis',
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController, 
    ResetPasswordController, 
    JwtAuthController, 
    MfaController,
    PlatformOneController,
    GameWardenController
  ],
})
export class AuthModule {}
