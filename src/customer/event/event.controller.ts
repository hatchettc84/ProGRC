import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { CustomerEvent, CustomerEventType } from "src/entities/customerEvent.entity";
import { AuthGuard } from "src/guards/authGuard";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { UserRole } from "src/masterData/userRoles.entity";
import { CreateUpdateEventRequest } from "./event.dto";
import { CreateEventService } from "./service/createEvent.service";
import { DeleteEventService } from "./service/deleteEvent.service";
import { GetEventService } from "./service/getEvent.service";
import { UpdateEventService } from "./service/updateEvent.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller('customers/:id/events')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
@ApiTags('Customer')
export class EventController {
    constructor(
        private readonly createEventService: CreateEventService,
        private readonly getEventService: GetEventService,
        private readonly deleteEventService: DeleteEventService,
        private readonly updateEventService: UpdateEventService,
    ) { }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                type: {
                    enum: [
                        CustomerEventType.KICKOFF,
                        CustomerEventType.MONTHLY_CHECK_IN,
                        CustomerEventType.QUARTERLY_VALUE_PLAN,
                    ], description: 'Type of event'
                },
                notes: { type: 'string', description: 'Notes' },
                date: { type: 'string', description: 'Date of event', example: 'YYYY-MM-DD' },
                done: { type: 'boolean', description: 'Is event done?' },
            }
        }
    })
    @Post()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async createEvent(
        @Param('id') id: string,
        @Req() req: any,
        @Body() data: CreateUpdateEventRequest,
    ) {
        await this.createEventService.createEvent(req['user_data'], {
            customerId: id,
            type: data.type,
            notes: data.notes,
            date: data.date,
            done: data.done,
        });
    }

    @ApiQuery({
        name: 'start-date',
        required: false,
        type: Date,
        example: 'YYYY-MM-DD',
        description: 'Default is 30 days before today',
    })
    @ApiQuery({
        name: 'end-date',
        required: false,
        type: Date,
        example: 'YYYY-MM-DD',
        description: 'Default is today',
    })
    @ApiResponse({
        status: 200,
        description: 'List of events',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            type: { type: 'string' },
                            notes: { type: 'string' },
                            date: { type: 'string' },
                            done: { type: 'boolean' },
                            created_by: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    email: { type: 'string' },
                                }
                            }
                        }
                    }
                }
            },
        }
    })
    @Get()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async getEvents(
        @Param('id') id: string,
        @Query('start-date') startDate: Date,
        @Query('end-date') endDate: Date,
    ): Promise<any> {
        if (!endDate) {
            endDate = new Date();
        }

        if (!startDate) {
            startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 30);
        }

        const events: CustomerEvent[] = await this.getEventService.getCustomerEvents(id, startDate, endDate);
        return events.map(event => ({
            id: event.id,
            type: event.type,
            notes: event.notes,
            date: event.date,
            done: event.done,
            created_by: {
                id: event.created_by_user.id,
                name: event.created_by_user.name,
                email: event.created_by_user.email,
            },
        }));
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                type: {
                    enum: [
                        CustomerEventType.KICKOFF,
                        CustomerEventType.MONTHLY_CHECK_IN,
                        CustomerEventType.QUARTERLY_VALUE_PLAN,
                    ], description: 'Type of event'
                },
                notes: { type: 'string', description: 'Notes' },
                date: { type: 'string', description: 'Date of event', example: 'YYYY-MM-DD' },
                done: { type: 'boolean', description: 'Is event done?' },
            }
        }
    })
    @Put(':eventId')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async updateEvent(
        @Req() req: any,
        @Param('id') id: string,
        @Param('eventId') eventId: number,
        @Body() data: CreateUpdateEventRequest,
    ) {
        await this.updateEventService.updateCustomerEvent(req['user_data'], id, eventId, {
            notes: data.notes,
            done: data.done,
            date: data.date,
            type: data.type,
        });
    }

    @Delete(':eventId')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async deleteEvent(
        @Param('id') id: string,
        @Param('eventId') eventId: number,
    ) {
        await this.deleteEventService.deleteCustomerEvent(id, eventId);
    }
}
