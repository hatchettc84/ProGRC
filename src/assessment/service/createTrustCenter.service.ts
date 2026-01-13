import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SqsService } from "@ssut/nestjs-sqs";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { AsyncTask, TaskOps, TaskStatus } from "src/entities/asyncTasks.entity";
import { TrustCenter } from "src/entities/trustCenter.entity";
import { DataSource, EntityManager, Repository } from "typeorm";
import { AssessmentPolicyService } from "./assessmentPolicy.service";

@Injectable()
export class CreateTrusCenter {
  constructor(
    @InjectRepository(AssessmentDetail)
    private readonly assessmentDetailRepo: Repository<AssessmentDetail>,
    private readonly sqsProducerService: SqsService,
    private readonly dataSource: DataSource,
    private readonly assessmentPolicyService: AssessmentPolicyService
  ) {}

  async createTrustCenterPDF(
    userInfo: { userId: string; customerId: string },
    assessmentId: number
  ): Promise<void> {
    const assessment: AssessmentDetail = await this.getAssessmentDetail(
      assessmentId,
      userInfo.customerId
    );

    if (assessment.is_locked) {
      throw new BadRequestException(
        "Cannot create trust center for locked assessment"
      );
    }

    await this.assessmentPolicyService.canExportAssessment(
      userInfo,
      assessment.app_id
    );

    await this.dataSource.transaction(async (manager) => {
      let trustCenter = await this.createTrustCenter(
        manager,
        assessment.app_id,
        assessmentId,
        userInfo,
        assessment
      );

      const bodyMessage: any = this.prepareMessagePayload(
        assessment.app_id,
        userInfo,
        assessmentId,
        trustCenter
      );

      const asyncTask: AsyncTask = await this.createAsyncTask(
        manager,
        assessment.app_id,
        userInfo,
        trustCenter,
        bodyMessage
      );

      bodyMessage.asyncTaskId = asyncTask.id;

      await this.sendToQueue(process.env.BACKEND_QUEUE_NAME, {
        id: assessmentId.toString(),
        body: { type: "assessment-pdf", payload: bodyMessage },
      }, 'assessment pdf');
    });
  }

  private async getAssessmentDetail(
    assessmentId: number,
    customerId: string
  ): Promise<AssessmentDetail> {
    return this.assessmentDetailRepo.findOneOrFail({
      where: {
        id: assessmentId,
        customer_id: customerId,
        is_deleted: false,
      },
      relations: ["outline"],
    });
  }

  private async createTrustCenter(
    manager: EntityManager,
    appId: number,
    assessmentId: number,
    userInfo: { userId: string; customerId: string },
    assessment: AssessmentDetail
  ): Promise<TrustCenter> {
    const trustCenter: TrustCenter = manager.create(TrustCenter, {
      app_id: appId,
      assessment_id: assessmentId,
      customer_id: userInfo.customerId,
      name: `Assessment SSP - NIST800 - ${assessment.title}`,
      created_by: userInfo.userId,
      updated_by: userInfo.userId,
      created_at: new Date(),
      updated_at: new Date(),
      assessment_version: assessment.outline.version,
    });

    return manager.save(trustCenter);
  }

  private prepareMessagePayload(
    appId: number,
    userInfo: { customerId: string },
    assessmentId: number,
    trustCenter: TrustCenter
  ): any {
    return {
      appId,
      customerId: userInfo.customerId,
      assessmentId,
      version: trustCenter.assessment_version,
      action: "TRUST_CENTER",
      trustCenterId: trustCenter.id,
    };
  }

  private async createAsyncTask(
    manager: EntityManager,
    appId: number,
    userInfo: { userId: string; customerId: string },
    trustCenter: TrustCenter,
    bodyMessage: any
  ): Promise<AsyncTask> {
    const asyncTask = manager.create(AsyncTask, {
      app_id: appId,
      customer_id: userInfo.customerId,
      ops: TaskOps.EXPORT_TRUST_CENTER,
      request_payload: bodyMessage,
      status: TaskStatus.PENDING,
      created_by: userInfo.userId,
      updated_by: userInfo.userId,
      created_at: new Date(),
      updated_at: new Date(),
      entity_id: trustCenter.id.toString(),
      entity_type: manager.getRepository(TrustCenter).metadata.tableName,
    });

    return manager.save(asyncTask);
  }

  private async sendToQueue(queueName: string | undefined, payload: any, context: string) {
    if (process.env.AWS_SQS_ENABLED === 'false') {
      console.warn(`SQS disabled; skipping ${context} message`);
      return;
    }
    if (!queueName) {
      console.warn(`SQS queue not configured; skipping ${context} message`);
      return;
    }
    await this.sqsProducerService.send(queueName, payload);
  }
}
