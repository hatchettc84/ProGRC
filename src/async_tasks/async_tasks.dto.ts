import { IsEnum, IsString } from 'class-validator';

export enum TypeTask {
    CREATE_ASSETS = 'CREATE_ASSETS',
    CREATE_UPDATE_ASSESSMENT = 'CREATE_UPDATE_ASSESSMENTS',
    UPDATE_COMPLIANCE = 'UPDATE_COMPLIANCE',
    CONTROL_EVALUATION = 'CONTROL_EVALUATION',
    CREATE_POLICY = 'CREATE_POLICY',
    UPDATE_POLICY = 'UPDATE_POLICY',



}

export class PendingTasksRequest {
    @IsString()
    app_id: string;

    @IsEnum(TypeTask, { message: 'type must be a valid TypeTask value' })
    type: TypeTask;
}
