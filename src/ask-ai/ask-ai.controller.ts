import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AskAiService } from 'src/ask-ai/ask-ai.service';
import { AuthGuard } from 'src/guards/authGuard';
import { Roles } from 'src/decorators/roles.decorator';
import * as metadata from '../common/metadata';
import { ApiBody, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SendMessageDto } from './dto/send-message.dto';
import { VoteDto } from './dto/vote.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

const userRoles = metadata['userRoles'];

@Controller('ask-ai')
@ApiBearerAuth()
export class AskAiController {
    constructor(private readonly askAiService: AskAiService) {}
    //TODO: remove this after testing
    @Post('query')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly)
    @ApiOperation({ summary: 'Submit a new query to the AI' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          assessment_id: { type: 'number' },
          section_id: { type: 'string' },
          section_text: { type: 'string' },
          selection_text: { type: 'string' },
          query_text: { type: 'string' },
          chat_history: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                selection_text: { type: 'string' },
                query_text: { type: 'string' },
              },
            },
          },
          ai_rewrite: { type: 'boolean' },
        },
        required: ['assessment_id', 'query_text'],
      },
    })
    @ApiResponse({
        status: 201,
        description: 'The query has been successfully submitted.',
        schema: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              assessment_id: { type: 'number' },
              section_id: { type: 'string' },
              query_text: { type: 'string' },
              content: { type: 'string' },
              description: { type: 'string' },
            },
          },
      })
    async submitQuery(@Request() req: any) {
      return this.askAiService.submitQuery(req['user_data'], req.body);
    }

    @Post('sendMessage')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiOperation({ summary: 'Send a message to the chat server' })
    @ApiResponse({
        status: 200,
        description: 'Message sent successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'message to display' },
                recommended_query: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Question 1', 'Question 2']
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'fail reason' }
            }
        }
    })
    async sendMessage(@Body() sendMessageDto: SendMessageDto) {
        return this.askAiService.sendMessage(sendMessageDto);
    }

    @Post('vote')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiOperation({ summary: 'Submit a vote for a chat message' })
    @ApiResponse({
        status: 200,
        description: 'Vote submitted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'success' }
            }
        }
    })
    async submitVote(@Body() voteDto: VoteDto) {
        return this.askAiService.submitVote(voteDto);
    }
}
