import { Body, Controller, Post, UseGuards, UseInterceptors, BadRequestException, Patch } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { XApiKeyGuard } from "src/guards/apiGuard";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { AssetDto } from "./assets.dto";
import { AssetsWebhookService } from "./assetsWebhook.service";

@Controller('webhook/assets')
@UseInterceptors(TransformInterceptor)
@ApiTags('assets')
export class AssetsWebhookController {
    constructor(
        private readonly assetsWebhook: AssetsWebhookService
    ) { }


    @Post()
    @UseGuards(XApiKeyGuard)
    @ApiSecurity('x-api-key')
    @ApiBody({ type: AssetDto })
    @ApiResponse({
        status: 201,
        description: 'Asset upserted successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid request data.',
    })
    async creatAssetsWebhook(
        @Body() request: AssetDto
    ): Promise<{ message: string }> {
        if (!request) {
            throw new BadRequestException('Please provide the data.');
        }

        // Call the service function to handle upsert
        const result = await this.assetsWebhook.createOrUpdateAsset(request);
        return result;  // This will return the message from the service function
    }


}
