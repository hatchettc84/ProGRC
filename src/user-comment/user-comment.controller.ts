import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserCommentService } from './user-comment.service';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { AuthGuard } from 'src/guards/authGuard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/masterData/userRoles.entity';
import { CreateUserComment, UpdateUserComment } from './user-comment.dto';
import { UserComment } from 'src/entities/userComment.entity';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('user-comment')
@ApiTags("User Comments")
@UseInterceptors(TransformInterceptor)
export class UserCommentController {
    constructor(
        private readonly userCommentService: UserCommentService,
    ) {}

    @Get("/:app_id/standard/:standard_id")
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.OrgMember)
    @ApiOperation({ summary: 'Get user comments by app ID and standard ID' })
    @ApiParam({ name: 'app_id', type: Number, example: 1 })
    @ApiParam({ name: 'standard_id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Success', schema: { example: [{ id: 1, comment: 'Sample comment', tags: ['tag1', 'tag2'], app_id: 1, standard_id: 1, control_id: 1 }] } })
    async getUserCommentsByAppIdAndStandardId(@Req() req: any, @Param('app_id') appId: number, @Param('standard_id') standardId: number) {
        const userComments: UserComment[] = await this.userCommentService.getUserCommentsByAppIdAndStandardId(req['user_data'], appId, standardId);
        return StandardResponse.success('Success', userComments);
    }

    @Get("/:app_id/standard/:standard_id/control/:control_id")
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.OrgMember)
    @ApiOperation({ summary: 'Get user comments for a specific control' })
    @ApiParam({ name: 'app_id', type: Number, example: 1 })
    @ApiParam({ name: 'standard_id', type: Number, example: 1 })
    @ApiParam({ name: 'control_id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Success', schema: { example: [{ id: 1, comment: 'Sample comment', tags: ['tag1', 'tag2'], app_id: 1, standard_id: 1, control_id: 1 }] } })
    async getUserCommentsForControl(@Req() req: any, @Param('app_id') appId: number, @Param('standard_id') standardId: number, @Param('control_id') controlId: number) {
        const userComments: UserComment[] = await this.userCommentService.getUserCommentsForControl(req['user_data'], appId, standardId, controlId);
        return StandardResponse.success('Success', userComments);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.OrgAdmin)
    @ApiOperation({ summary: 'Create a new user comment' })
    @ApiBody({ schema: { example: { comment: 'This is a comment', tags: ['tag1', 'tag2'], app_id: 1, standard_id: 1, control_id: 1 } } })
    @ApiResponse({ status: 201, description: 'Created', schema: { example: { id: 1, comment: 'This is a comment', tags: ['tag1', 'tag2'], app_id: 1, standard_id: 1, control_id: 1 } } })
    async createUserComment(@Req() req: any, @Body() body: CreateUserComment) {
        const userComment: UserComment = await this.userCommentService.createUserComment(req['user_data'], body);
        return StandardResponse.success('Success', userComment);
    }

    @Patch("/:comment_id")
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.OrgAdmin)
    @ApiOperation({ summary: 'Update an existing user comment' })
    @ApiParam({ name: 'comment_id', type: Number, example: 1 })
    @ApiBody({ schema: { example: { comment: 'Updated comment', tags: ['tag1', 'tag2'] } } })
    @ApiResponse({ status: 200, description: 'Success', schema: { example: { id: 1, comment: 'Updated comment', tags: ['tag1', 'tag2'], app_id: 1, standard_id: 1, control_id: 1 } } })
    async updateUserComment(@Req() req: any, @Body() body: UpdateUserComment, @Param('comment_id') commentId: number) {
        const userComment: UserComment = await this.userCommentService.updateUserComment(req['user_data'], body, commentId);
        return StandardResponse.success('Success', userComment);
    }

    @Delete("/:comment_id")
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.OrgAdmin)
    @ApiOperation({ summary: 'Delete a user comment' })
    @ApiParam({ name: 'comment_id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Success' })
    async deleteUserComment(@Req() req: any, @Param('comment_id') commentId: number) {
        await this.userCommentService.deleteUserComment(req['user_data'], commentId);
        return StandardResponse.success('Success');
    }

    @Get("/:app_id/standard/:standard_id/ai/summarize")
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.OrgMember, UserRole.OrgAdmin, UserRole.CSM)
    @ApiOperation({ summary: 'Summarize comments using AI' })
    @ApiParam({ name: 'app_id', type: Number })
    @ApiParam({ name: 'standard_id', type: Number })
    @ApiParam({ name: 'control_id', type: Number, required: false })
    @ApiResponse({ status: 200, description: 'Comments summarized successfully' })
    async summarizeComments(
        @Param('app_id') appId: number,
        @Param('standard_id') standardId: number,
        @Param('control_id') controlId?: number
    ) {
        const summary = await this.userCommentService.summarizeComments(appId, standardId, controlId);
        return StandardResponse.success('Comments summarized successfully', summary);
    }

    @Get("/:app_id/standard/:standard_id/ai/action-items")
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.OrgMember, UserRole.OrgAdmin, UserRole.CSM)
    @ApiOperation({ summary: 'Extract action items from comments using AI' })
    @ApiParam({ name: 'app_id', type: Number })
    @ApiParam({ name: 'standard_id', type: Number })
    @ApiParam({ name: 'control_id', type: Number, required: false })
    @ApiResponse({ status: 200, description: 'Action items extracted successfully' })
    async extractActionItems(
        @Param('app_id') appId: number,
        @Param('standard_id') standardId: number,
        @Param('control_id') controlId?: number
    ) {
        const actionItems = await this.userCommentService.extractActionItems(appId, standardId, controlId);
        return StandardResponse.success('Action items extracted successfully', actionItems);
    }

    @Post("/:comment_id/ai/suggest-response")
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.OrgAdmin, UserRole.CSM)
    @ApiOperation({ summary: 'Suggest response to a comment using AI' })
    @ApiParam({ name: 'comment_id', type: Number })
    @ApiResponse({ status: 200, description: 'Response suggested successfully' })
    async suggestResponse(@Param('comment_id') commentId: number) {
        const response = await this.userCommentService.suggestResponse(commentId);
        return StandardResponse.success('Response suggested successfully', { response });
    }
}
