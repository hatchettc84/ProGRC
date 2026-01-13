import { Customer } from 'src/entities/customer.entity';
import { App } from 'src/entities/app.entity';
import { AssessmentDetail } from 'src/entities/assessments/assessmentDetails.entity';
import { User } from 'src/entities/user.entity';

export interface AssessmentContext {
    customer_id: string;
    application_id: number;
    user_id: string;
    standard_id?: number;
    policy_id?: number;
    assessment_id?: number;
}

export interface AiPromptRequest {
    prompt: string;
    context: any;
    output_format: string;
    variable_inputs?: Record<string, any>;
} 