import { Controller, Get, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AsyncTasksService } from 'src/async_tasks/async_tasks.service';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/authGuard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import * as metadata from '../common/metadata';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
const userRoles = metadata['userRoles'];

@ApiTags('Notifications')
@Controller('notifications')
@UseInterceptors(TransformInterceptor)
export class NotificationsController {
    constructor(private asyncService: AsyncTasksService, private notificationServices: NotificationsService) { }


    @Get("")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiQuery({ name: 'limit', description: 'How many to fetch at a time' })
    @ApiQuery({ name: 'offset', description: 'How many to skip' })
    @ApiQuery({ name: 'limitedTime', description: 'Specifies whether to limit the results based on a time filter. If not provided, defaults to true, meaning results are limited by time. (24 Hours)' })
    async taskDetails(@Request() req: any): Promise<StandardResponse> {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
        const limitedTime = req.query.limitedTime?.toLowerCase() === 'false' ? false : true;
        const [notifications, total] = await this.notificationServices.getAsyncTask(req.body, req['user_data'], { limit, offset, limitedTime });
        return StandardResponse.successWithTotal("Success", notifications, { total, limit, offset });
    }
}
