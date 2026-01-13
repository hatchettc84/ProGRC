import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class GetAsyncTaskPendingService {
    constructor(
        @InjectRepository(AsyncTask) private readonly asyncTaskRepository: Repository<AsyncTask>,
    ) { }

    async hasPendingTaskForApplication(userInfo: { customerId: string }, appId: number): Promise<boolean> {
        const pendingTask: AsyncTask = await this.asyncTaskRepository.findOne({
            select: ['id'],
            where: {
                app_id: appId,
                customer_id: userInfo.customerId,
                status: In(AsyncTask.pendingTaskStatus()),
            },
            order: {
                created_at: 'DESC',
            }
        });

        return !!pendingTask;
    }
}
