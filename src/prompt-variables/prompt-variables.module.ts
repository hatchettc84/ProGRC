import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptTemplateVariable } from 'src/entities/promptTemplateVariable.entity';
import { PromptVariableController } from './prompt-variable.controller';
import { PromptVariableService } from './prompt-variable.service';
import { PromptVariableProcessor } from './prompt-variable-processor.service';
import { AskAiModule } from 'src/ask-ai/ask-ai.module';
import { LoggerService } from 'src/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { AskAiService } from 'src/ask-ai/ask-ai.service';
import { Customer } from 'src/entities/customer.entity';
import { User } from 'src/entities/user.entity';
import { AssessmentDetail } from 'src/entities/assessments/assessmentDetails.entity';
import { AssessmentOutline } from 'src/entities/assessments/assessmentOutline.entity';
import { AssessmentHistory } from 'src/entities/assessments/assessmentHistory.entity';
import { AssessmentSections } from 'src/entities/assessments/assessmentSections.entity';
import { AssessmentSectionsHistory } from 'src/entities/assessments/assessmentSectionsHistory.entity';
import { Standard } from 'src/entities/standard_v1.entity';
import { Control } from 'src/entities/compliance/control.entity';
import { HttpModule, HttpService } from '@nestjs/axios';
import { RoleHierarchyService } from 'src/auth/roleHierarchy.service';
import { CustomerCsm } from 'src/entities/customerCsm.entity';
import { CognitoService } from 'src/auth/cognitoAuth.service';
import { PermissionValidatorService } from 'src/auth/permissionValidator.service';
import { DomainCacheService } from 'src/cache/domain-cache.service';
import { LicenseRule } from 'src/entities/licenseRule.entity';
import { LicenseType } from 'src/entities/lincenseType.entity';
import { Permission } from 'src/entities/permission.entity';
import { UserRole, UserRoles } from 'src/masterData/userRoles.entity';
import { OllamaService } from 'src/llms/ollama.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([PromptTemplateVariable, Customer, User, AssessmentDetail, AssessmentOutline, AssessmentHistory, AssessmentSections, AssessmentSectionsHistory, Standard, Control, CustomerCsm, LicenseRule, LicenseType, Permission, UserRoles]),
        AskAiModule,
        HttpModule,
    ],
    controllers: [PromptVariableController],
    providers: [
        PromptVariableService,
        PromptVariableProcessor,
        LoggerService,
        // AskAiService is provided by AskAiModule (imported above)
        OllamaService, // Required by AskAiService
        ConfigService,
        RoleHierarchyService,
        CognitoService,
        PermissionValidatorService,
        DomainCacheService
    ],
    exports: [
        PromptVariableService,
        PromptVariableProcessor
    ]
})
export class PromptVariablesModule {} 