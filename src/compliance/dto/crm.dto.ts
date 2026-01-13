import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for updating CRM file path
 */
export class UpdateCrmFileRequest {
  @ApiProperty({
    description: 'The uuid of the uploaded CRM file',
    example: '9c123e45-6789-0123-4567-890123456789'
  })
  @IsNotEmpty()
  @IsString()
  uuid: string;
}

/**
 * Response DTO for CRM file update
 */
export class UpdateCrmFileResponse {
  @ApiProperty({
    description: 'Success message',
    example: 'CRM file updated and processing initiated'
  })
  message: string;

  @ApiProperty({
    description: 'ID of the created async task',
    example: 12345
  })
  taskId: number;
}

/**
 * DTO for validating a CRM file in S3
 */
export class ValidateCrmFileRequest {
  @ApiProperty({
    description: 'The S3 path of the CRM file to validate',
    example: 'customer/123/app/456/standard/789/crm/file.csv'
  })
  @IsNotEmpty()
  @IsString()
  filePath: string;

  @ApiProperty({
    description: 'The app id',
    example: 123
  })
  @IsOptional()
  @IsNumber()
  appId: number;

  @ApiProperty({
    description: 'The standard id',
    example: 123
  })
  @IsOptional()
  @IsNumber()
  standardId: number;

  @ApiProperty({
    description: 'The customer id',
    example: '123'
  })
  @IsOptional()
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'Whether to save the data to the database',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  saveData: boolean;
}

export class CrmCsvRow {
  "Control ID": string;
  "CRM Status": string;
  "CRM Explanation": string;
  "CRM Parameters": string;
  "CRM Provider": string = 'Palantir';
}