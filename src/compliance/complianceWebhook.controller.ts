// import { Body, Controller, Post, UseInterceptors } from "@nestjs/common";
// import { ApiBody, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
// import { TransformInterceptor } from "src/interceptors/transform.interceptor";
// import { WebhookTypeRequest } from "./controlDetails.dto";
// import { WEbhookUpdateEnhancementService } from "./service/webhookUpdateEnhancement.service";

// @Controller('webhook/compliances')
// @UseInterceptors(TransformInterceptor)
// @ApiTags('compliances')
// export class ComplianceWebhookController {
//     constructor(
//         private readonly webhookUpdateEnhancementService: WEbhookUpdateEnhancementService
//     ) { }

//     @Post()
//     // @UseGuards(XApiKeyGuard)
//     @ApiSecurity('x-api-key')
//     @ApiBody({
//         schema: {
//             type: 'object',
//             properties: {
//                 type: { type: 'string', example: 'enhancement' },
//                 data: {
//                     type: 'array',
//                     items: {
//                         type: 'object',
//                         properties: {
//                             id: { type: 'string', example: 'd58a11fd-73fb-4666-8470-4e4612989ec3' },
//                             app_id: { type: 'string', example: '411f0d0f-3a40-4a52-97e3-19fdfd5024e5' },
//                             control_enhancement_id: { type: 'string', example: 'AC-2(1) AUTOMATED SYSTEM ACCOUNT MANAGEMENT' },
//                             control_parent_id: { type: 'string', example: 'AC-2 ACCOUNT MANAGEMENT' },
//                             user_explanation: { type: 'string', example: 'The API endpoints support automated account management.' },
//                             implementation_status: {
//                                 type: 'string',
//                                 enum: [ // percentage_completion score
//                                     'not_implemented', // 0
//                                     'implemented', // 100
//                                     'partially_implemented', // 50
//                                     'not_applicable', // exclude the calculation
//                                     'planned', // 0
//                                     'alternative_implementation' // 100
//                                 ],
//                                 example: 'not_implemented'
//                             },
//                             implementation_explanation: { type: 'string', example: 'Automated account management is supported through API endpoints, enhancing efficiency.' },
//                             implementation_explanationEmbedding: { type: 'string', example: '[Embedding of explanation]' },
//                             source_id: { type: 'string', example: '35f1c55b-f212-48ae-8b9c-344c032cf136' },
//                             asset_ids: { type: 'array', items: { type: 'string', example: '35f1c55b-f212-48ae-8b9c-344c032cf136' }, example: ['35f1c55b-f212-48ae-8b9c-344c032cf136'] },
//                             customer_id: { type: 'number', example: 50002 },
//                         }
//                     }
//                 }
//             }
//         }
//     })
//     @ApiResponse({
//         status: 200, description: 'Webhook received',
//         schema: {
//             type: 'object',
//             properties: {
//                 code: { type: 'string', example: '200' },
//                 message: { type: 'string', example: 'Success' }
//             }
//         }
//     })
//     async complianceWebhook(
//         @Body() request: WebhookTypeRequest
//     ) {
//         if (request.type === 'enhancement') {
//             await this.webhookUpdateEnhancementService.updateEnhancement(request.data);
//         }

//     }
// }
