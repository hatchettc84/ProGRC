import { BadRequestException } from "@nestjs/common";
import { IsDateString, IsOptional, IsString } from "class-validator";

export class UpdateTrustCenterRequest {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    @IsDateString({ strict: true }, { message: 'submissionDate must be in YYYY-MM-DD format' })
    approvalDate?: Date;

    @IsOptional()
    @IsString()
    @IsDateString({ strict: true }, { message: 'submissionDate must be in YYYY-MM-DD format' })
    submissionDate?: Date

    validate() {
        if (!this.name && !this.approvalDate && !this.submissionDate) {
            throw new BadRequestException('At least one field name, approval_date, submission_date is required');
        }
    }
}
