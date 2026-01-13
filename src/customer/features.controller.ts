import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CreateFeatureRequest, FeatureResponse } from "./features.dto";
import { FeaturesService } from "./service/features.service";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { UserRole } from "src/masterData/userRoles.entity";


@Controller('features')
@ApiTags('Features')
@UseInterceptors(TransformInterceptor)
export class FeaturesController {
    constructor(
        private readonly featuresService: FeaturesService
    ) { }

    @Get('customer/:customerId/flags')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiOperation({ 
        summary: 'Get features for a customer',
        description: 'Retrieves all feature flags for a specific customer. Only accessible by CSM role. Returns an empty array if no features are found.'
    })
    @ApiParam({
        name: 'customerId',
        description: 'The UUID of the customer',
        type: 'string',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved customer features. Returns an empty array if no features exist.',
        type: [FeatureResponse],
        examples: {
            'With Features': {
                summary: 'Response with features',
                value: {
                    code: '200',
                    message: 'Success',
                    data: [
                        {
                            id: 1,
                            customer_id: 'customer_id',
                            key: 'enable_calendly',
                            flag: true
                        }
                    ]
                }
            },
            'No Features': {
                summary: 'Response with no features',
                value: {
                    code: '200',
                    message: 'Success',
                    data: []
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing authentication token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - User does not have CSM role'
    })
    async getFeaturesByCustomerId(
        @Param('customerId') customerId: string
    ): Promise<StandardResponse<FeatureResponse[]>> {
        const features = await this.featuresService.getFeaturesByCustomerId(customerId);
        return StandardResponse.success('Success', features || []);
    }

    @Get('my-features')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgAdmin, UserRole.CSM, UserRole.CSM_AUDITOR, UserRole.AUDITOR, UserRole.SuperAdmin, UserRole.OrgMember)
    @ApiOperation({ 
        summary: 'Get features for current customer',
        description: 'Retrieves all feature flags for the currently authenticated customer. Only accessible by OrgAdmin role. Returns an empty array if no features are found.'
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved customer features. Returns an empty array if no features exist.',
        type: [FeatureResponse],
        examples: {
            'With Features': {
                summary: 'Response with features',
                value: {
                    code: '200',
                    message: 'Success',
                    data: [
                        {
                            id: 1,
                            customer_id: 'customer_id',
                            key: 'enable_calendly',
                            flag: true
                        }
                    ]
                }
            },
            'No Features': {
                summary: 'Response with no features',
                value: {
                    code: '200',
                    message: 'Success',
                    data: []
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing authentication token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - User does not have OrgAdmin role'
    })
    async getMyFeatures(
        @Req() req: any
    ): Promise<StandardResponse<FeatureResponse[]>> {
        const features = await this.featuresService.getFeaturesByCustomerId(req['user_data']['customerId']);
        return StandardResponse.success('Success', features || []);
    }

    @Put()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiOperation({ 
        summary: 'Create or update a feature',
        description: 'Creates a new feature flag or updates an existing one for a customer. Only accessible by CSM role.'
    })
    @ApiBody({
        type: CreateFeatureRequest,
        description: 'Feature flag data',
        examples: {
            example1: {
                value: {
                    customer_id: 'customer_id',
                    key: 'enable_calendly',
                    flag: true
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully created or updated feature',
        type: FeatureResponse,
        examples: {
            'Success': {
                summary: 'Feature created/updated successfully',
                value: {
                    code: '200',
                    message: 'Success',
                    data: {
                        id: 1,
                        customer_id: 'customer_id',
                        key: 'enable_calendly',
                        flag: true
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request - Invalid input data'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing authentication token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - User does not have CSM role'
    })
    async createOrUpdateFeature(
        @Body() data: CreateFeatureRequest
    ): Promise<StandardResponse<FeatureResponse>> {
        const feature = await this.featuresService.createOrUpdateFeature(data);
        if (!feature) {
            return StandardResponse.success('Success', {
                id: 0,
                customer_id: data.customer_id,
                key: data.key,
                flag: data.flag
            });
        }
        return StandardResponse.success('Success', feature);
    }

    @Delete(':key')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiOperation({ 
        summary: 'Delete features by key',
        description: 'Deletes all feature flags with the specified key across all customers. Only accessible by CSM role.'
    })
    @ApiParam({
        name: 'key',
        description: 'The feature key to delete',
        type: 'string',
        example: 'enable_calendly'
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully deleted features or no features found with the given key',
        examples: {
            'Success': {
                summary: 'Features deleted successfully',
                value: {
                    code: '200',
                    message: 'Success',
                    data: null
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing authentication token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - User does not have CSM role'
    })
    async deleteFeatureByKey(
        @Param('key') key: string
    ): Promise<StandardResponse<void>> {
        await this.featuresService.deleteFeatureByKey(key);
        return StandardResponse.success('Success', null);
    }
} 