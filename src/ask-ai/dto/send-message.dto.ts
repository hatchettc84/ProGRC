import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class SendMessageDto {

  @ApiProperty({ description: 'Scope' })
  @IsString()
  @IsOptional()
  scope: string;

  @ApiProperty({ description: 'Session ID for unique chat session' })
  @IsString()
  @IsNotEmpty()
  session_id: string;



  @ApiProperty({ description: 'Unique conversation ID' })
  @IsString()
  @IsNotEmpty()
  conversation_id: string;

  @ApiProperty({ description: 'App ID' })
  @IsNumber()
  @IsNotEmpty()
  app_id: number;

  @ApiProperty({ description: 'Framework ID' })
  @IsNumber()
  @IsOptional()
  framework_id: number;

  @ApiProperty({ description: 'Standard ID' })
  @IsNumber()
  @IsOptional()
  standard_id: number;

  @ApiProperty({ description: 'Control ID' })
  @IsNumber()
  @IsOptional()
  control_id: number;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customer_id: string;

  @ApiProperty({ description: 'Message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Is valid' })
  @IsBoolean()
  @IsOptional()
  is_valid: boolean;
} 

export class SendMessageDSDto {

  @ApiProperty({ description: 'Scope' })
  @IsString()
  @IsOptional()
  scope: string;

  @ApiProperty({ description: 'Session ID for unique chat session' })
  @IsString()
  @IsNotEmpty()
  session_id: string;

  @ApiProperty({ description: 'Unique conversation ID' })
  @IsString()
  @IsNotEmpty()
  conversation_id: string;

  @ApiProperty({ description: 'App ID' })
  @IsNumber()
  @IsNotEmpty()
  app_id: number;

  @ApiProperty({ description: 'Framework ID' })
  @IsNumber()
  @IsOptional()
  framework_name: number;

  @ApiProperty({ description: 'Standard ID' })
  @IsNumber()
  @IsOptional()
  standard_name: number;

  @ApiProperty({ description: 'Control ID' })
  @IsNumber()
  @IsOptional()
  control_name: number;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customer_id: string;

  @ApiProperty({ description: 'Message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Is valid' })
  @IsBoolean()
  @IsOptional()
  is_valid: boolean;
} 