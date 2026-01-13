import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AsyncTasksService } from 'src/async_tasks/async_tasks.service';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Notification, NotificationAction, NotificationStatus, UserDTO } from './notification.interface';


export enum TaskOps {
  CREATE_ASSETS = 'CREATE_ASSETS',
  CREATE_ASSESSMENTS = 'CREATE_ASSESSMENTS',
  UPDATE_ASSETS = 'UPDATE_ASSETS',
  UPDATE_ASSESSMENTS = 'UPDATE_ASSESSMENTS',
  UPDATE_COMPLIANCE = 'UPDATE_COMPLIANCE',
  EXPORT_TRUST_CENTER = 'EXPORT_TRUST_CENTER',
  CONTROL_EVALUATION = 'CONTROL_EVALUATION',
  CREATE_POLICY = 'CREATE_POLICY',
  GENERATE_POAM = 'GENERATE_POAM',
  SYNC_JIRA = 'SYNC_JIRA',
  UPDATE_POLICY = 'UPDATE_POLICY',
  PROCESS_CRM = 'PROCESS_CRM',
  CLONE_APPLICATION = 'CLONE_APPLICATION',
}

export enum TaskStatus {
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
  IN_PROCESS = "IN_PROCESS",
  CANCELLED = "CANCELLED"
}

@Injectable()
export class NotificationsService {

  constructor(
    private asyncTaskService: AsyncTasksService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) { }

  async getAsyncTask(data: any, userInfo: any,
    { limit = 5, offset = 0, limitedTime = true }: { limit?: number; offset?: number; limitedTime?: boolean }
  ): Promise<[Notification[], number]> {
    const [tasks, count] = await this.asyncTaskService.getAsyncTask(data, userInfo, limit, offset, limitedTime);

    // Map tasks and wait for promises to resolve
    // Add a function to map TaskOps to NotificationAction

    const taskOpsMapping: Record<TaskOps, NotificationAction> = {
      [TaskOps.CREATE_ASSETS]: NotificationAction.CREATE_ASSETS,
      [TaskOps.CREATE_ASSESSMENTS]: NotificationAction.CREATE_ASSESSMENTS,
      [TaskOps.UPDATE_ASSETS]: NotificationAction.UPDATE_ASSETS,
      [TaskOps.UPDATE_ASSESSMENTS]: NotificationAction.UPDATE_ASSESSMENTS,
      [TaskOps.UPDATE_COMPLIANCE]: NotificationAction.UPDATE_COMPLIANCE,
      [TaskOps.EXPORT_TRUST_CENTER]: NotificationAction.EXPORT_TRUST_CENTER,
      [TaskOps.CONTROL_EVALUATION]: NotificationAction.CONTROL_EVALUATION,
      [TaskOps.CREATE_POLICY]: NotificationAction.CREATE_POLICY,
      [TaskOps.GENERATE_POAM]: NotificationAction.GENERATE_POAM,
      [TaskOps.SYNC_JIRA]: NotificationAction.SYNC_JIRA,
      [TaskOps.UPDATE_POLICY]: NotificationAction.UPDATE_POLICY,
      [TaskOps.PROCESS_CRM]: NotificationAction.PROCESS_CRM,
      [TaskOps.CLONE_APPLICATION]: NotificationAction.CLONE_APPLICATION,
    };

    const taskStatusMapping: Record<TaskStatus, NotificationStatus> = {
      [TaskStatus.PENDING]: NotificationStatus.PENDING,
      [TaskStatus.PROCESSED]: NotificationStatus.PROCESSED,
      [TaskStatus.FAILED]: NotificationStatus.FAILED,
      [TaskStatus.IN_PROCESS]: NotificationStatus.IN_PROCESS,
      [TaskStatus.CANCELLED]: NotificationStatus.CANCELLED,

    };

    const mapTaskOpsToNotificationAction = (ops: string): NotificationAction => {
      const action = taskOpsMapping[ops];
      if (!action) throw new Error(`Unsupported TaskOps: ${ops}`);
      return action;
    };

    const mapTaskStatusToNotificationAction = (status: string): NotificationStatus => {
      const notificationStatus = taskStatusMapping[status];
      if (!notificationStatus) throw new Error(`Unsupported TaskStatus: ${status}`);
      return notificationStatus;
    };


    // In the Promise.all block
    const notifications: Notification[] = await Promise.all(tasks.map(async task => ({
      id: task.id.toString(),
      author: await this.getUserName(task.created_by), // Resolve author name
      action: task.status,
      time: task.updated_at.toISOString(), // Convert Date to string
      applicationId: task.app_id,
      sourceFileName: task.request_payload?.Source,
      operation: mapTaskOpsToNotificationAction(task.ops), // Map TaskOps to NotificationAction
      status: mapTaskStatusToNotificationAction(task.status),
      entityId: task.entity_id,
      entityType: task.entity_type,
    })));


    return [notifications, count];
  }

  async getUserName(userId: string): Promise<UserDTO> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'], // Fetch role if necessary
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Map the User entity to the User interface
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      mobile: user.mobile,
      profile_image_key: user.profile_image_key || null, // Handle nullable profile image key
    };
  }

}
