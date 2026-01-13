import { Controller, Delete, Get, Post, Put, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/authGuard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import * as metadata from '../common/metadata';
import { SspService } from './ssp.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
const userRoles = metadata['userRoles'];

@ApiTags('SSP')
@Controller('api/')
export class SspController {

    constructor(private readonly sspSvc: SspService) { }

    @Post('docs/:doc_id/comment')
    @ApiOperation({ summary: 'Comment on SSP section' })
    @ApiParam({ name: 'doc_id', description: 'ID of the document' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                section_id: { type: 'string', description: 'UUId of the section' },
                element_id: { type: 'string', description: 'id of the element on which comment is done' },
                comment: { type: 'string', description: 'Comment by user' },
                selected_text: { type: 'string', description: 'Text Selected By User' },
            },
            required: ['section_id', 'comment', 'selected_text'],
        },
    })
    @ApiResponse({ status: 200, description: 'Comment added successfully!' })
    @ApiResponse({ status: 400, description: 'Could not add comment at the moment. Please try again later.' })
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.auditor)
    async addComment(@Request() req: any) {
        return await this.sspSvc.addComment(req.params.doc_id, req.body, req['user_data']);
    }

    @Get('docs/:doc_id/comments')
    @ApiOperation({ summary: 'Fetch Comments on SSP' })
    @ApiParam({ name: 'doc_id', description: 'ID of the document' })
    @ApiResponse({ status: 200, description: 'List of comments sorted by time.' })
    @UseInterceptors(TransformInterceptor)
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_member, userRoles.auditor)
    async getComments(@Request() req: any) {
        return await this.sspSvc.getComments(req.params.doc_id);
    }

    @Delete('docs/:docId/comments/:commentId')
    @ApiOperation({ summary: 'Delete Comment on SSP' })
    @ApiParam({ name: 'docId', description: 'ID of the document' })
    @ApiParam({ name: 'commentId', description: 'ID of the comment' })
    @ApiResponse({ status: 200, description: 'Comment deleted successfully!' })
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(TransformInterceptor)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.auditor)
    async deleteComment(@Request() req: any) {
        return await this.sspSvc.deleteComment(req.params.docId, req.params.commentId, req['user_data']);
    }

    @Get('docs/:doc_id/sources')
    async getDocSources(@Request() req: any) {
        return await this.sspSvc.getDocSources(req.params.doc_id);
    }
    /////Assessment Apis 

    @Get('/document/:doc_id/tree')
    @ApiOperation({ summary: 'Fetch Latest Version of Document tree' })
    @ApiParam({ name: 'doc_id', description: 'ID of the document' })
    @ApiResponse({ status: 200, description: 'Document tree with List of sections.' })
    async getLatestDocumentTree(@Request() req: any) {
        // return await this.sspSvc.getLatestDocumentTree(req.params.doc_id);
    }

    @Get('/document/:doc_id/fulltree')
    @ApiOperation({ summary: 'Fetch All Versions of Document tree' })
    @ApiParam({ name: 'doc_id', description: 'ID of the document' })
    @ApiResponse({ status: 200, description: 'List of All Document tree versions with List of sections.' })
    async getCompleteDocumentTree(@Request() req: any) {
        // return await this.sspSvc.getCompleteDocumentTree(req.params.doc_id);
    }

    @Get('/document/:doc_id/tree/versions')
    @ApiOperation({ summary: 'Fetch All Versions of Document tree' })
    @ApiParam({ name: 'doc_id', description: 'ID of the document' })
    @ApiResponse({ status: 200, description: 'List of All Document tree versions (No Data).' })
    async getTreeVersionList(@Request() req: any) {
        // return await this.sspSvc.getTreeVersionList(req.params.doc_id);
    }

    @Get('/document/:doc_id/sections')
    @ApiOperation({ summary: 'Fetch All Sections of Document in Paginated manner' })
    @ApiParam({ name: 'doc_id', description: 'ID of the document' })
    @ApiQuery({ name: 'limit', description: 'How many to fetch at a time' })
    @ApiQuery({ name: 'offset', description: 'How many to skip' })
    @ApiResponse({ status: 200, description: 'List of All Sections and their content and version info.' })
    async getPaginatedSections(@Request() req: any) {
        const { limit, offset } = req.query;
        // return await this.sspSvc.getPaginatedSections(req.params.doc_id, parseInt(limit), parseInt(offset));
    }


    @Put('/document/:doc_id/sections')
    @ApiOperation({ summary: 'Update content of section/s' })
    @ApiParam({ name: 'doc_id', description: 'ID of the document' })
    @ApiBody({
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    section_id: { type: 'string', description: 'Id of the section' },
                    title: { type: 'string', description: 'Title of the section' },
                    new_content: { type: 'string', description: 'Updated content of the section', },
                },
                required: ['section_id', 'title', 'new_content']
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Sections updated successfully!' })
    async updateDocSections(@Request() req: any) {
        // return this.sspSvc.updateSections(req.params.doc_id, req.body);
    }
}
