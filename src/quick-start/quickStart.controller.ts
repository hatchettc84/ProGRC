import { Controller, Get, Post, Body, Param, UseInterceptors, UseGuards, Request, Query } from '@nestjs/common';
import { CheckListItem, QuickStartService } from './quickStart.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { SnakeCaseInterceptor } from 'src/interceptors/snakeCase.interceptor';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/authGuard';
import { UserRole } from 'src/masterData/userRoles.entity';
import { convertToValidAppId } from 'src/utils/appIdConverter';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('QuickStart')
@Controller('quickStart')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class QuickStartController {
  constructor(private readonly quickStartService: QuickStartService) {}

  @Get('/checkList')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.OrgMember, UserRole.OrgAdmin)
  @ApiOperation({ summary: 'Get all checklist items' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved checklist items' })
  async getCheckListItems(@Request() req: any) {
    return this.quickStartService.getCheckListItems(req['user_data']);
  }


  @Post('/checkList')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.OrgMember, UserRole.OrgAdmin)
  @ApiOperation({ summary: 'Update checklist items' })
  @ApiResponse({ status: 200, description: 'Successfully updated checklist items' })
  async updateCheckList(@Request() req: any, @Query('app_id') appId?: string,) {
      const appIdNumber = appId ? parseInt(appId, 10) : null;
      return this.quickStartService.updateCheckList(req['user_data'], appIdNumber, req.body);
  }
}