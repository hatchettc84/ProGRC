import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApplicationControlMapping, ApplicationControlMappingStatus } from "src/entities/compliance/applicationControlMapping.entity";
import { DataSource, In, Repository } from "typeorm";

@Injectable()
export class ControlExceptionV2Service {
    constructor(
        @InjectRepository(ApplicationControlMapping) private readonly appControlRepo: Repository<ApplicationControlMapping>,
        private readonly dataSource: DataSource
    ) { }

    async setEnhancementsException(userInfo: { userId: string, customerId: string },
        appId: number,
        param: { ids: number[], exceptionReason: string }):
        Promise<void> {
        const uniqueIds = Array.from(new Set(param.ids));

        const controls: ApplicationControlMapping[] = await this.appControlRepo.find({
            select: ['id'],
            where: {
                id: In(uniqueIds),
                app_id: appId,
            }
        });

        if (controls.length !== uniqueIds.length) {
            throw new BadRequestException("Invalid control id");
        }

        await this.dataSource.transaction(async (manager) => {
            await manager.update(ApplicationControlMapping, { app_id: appId, id: In(uniqueIds) }, {
                user_implementation_status: ApplicationControlMappingStatus.EXCEPTION,
                exception_reason: param.exceptionReason,
                is_excluded: true,
                updated_at: new Date(),
            });

        });
    }

    async removeException(userInfo: { userId: string, customerId: string },
        appId: number,
        controlIds: number[]
    ): Promise<void> {
        const uniqueIds = Array.from(new Set(controlIds));

        const controls: ApplicationControlMapping[] = await this.appControlRepo.find({
            select: ['id'],
            where: {
                id: In(uniqueIds),
                app_id: appId,
            }
        });

        if (controls.length !== uniqueIds.length) {
            throw new BadRequestException("Invalid control id");
        }

        await this.dataSource.transaction(async (manager) => {
            await manager.update(ApplicationControlMapping, { app_id: appId, id: In(uniqueIds) }, {
                user_implementation_status: null,
                exception_reason: null,
                is_excluded: false,
                updated_at: new Date(),
            });
        });
    }

}
