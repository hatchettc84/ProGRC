import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Features } from "src/entities/features.entity";
import { FeaturesController } from "./features.controller";
import { FeaturesService } from "./service/features.service";
import { LoggerService } from "src/logger/logger.service";
import { RoleHierarchyService } from "src/auth/roleHierarchy.service";
import { User } from "src/entities/user.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { Customer } from "src/entities/customer.entity";
import { CognitoClient } from "src/auth/cognito.config";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { JwtService } from "@nestjs/jwt";
import { CognitoService } from "src/auth/cognitoAuth.service";
import { PermissionValidatorService } from "src/auth/permissionValidator.service";
import { DomainCacheModule } from "src/cache/domain-cache.module";
import { LicenseType } from "src/entities/lincenseType.entity";
import { LicenseRule } from "src/entities/licenseRule.entity";
import { Permission } from "src/entities/permission.entity";
import { UserRoles } from "src/masterData/userRoles.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Features, User, Customer, CustomerCsm, LicenseType,LicenseRule, Permission, UserRoles]),
        DomainCacheModule
    ],
    controllers: [FeaturesController],
    providers: [FeaturesService, LoggerService, RoleHierarchyService, CognitoIdentityProviderClient, JwtService, CognitoService, PermissionValidatorService
     ],
    exports: [FeaturesService]
})
export class FeaturesModule {} 