import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsIn, IsOptional } from 'class-validator';

export class VoteDto {
  @ApiProperty({ description: 'Session ID for unique chat session' })
  @IsString()
  @IsNotEmpty()
  session_id: string;

  @ApiProperty({ description: 'Unique conversation ID' })
  @IsString()
  @IsNotEmpty()
  conversation_id: string;

  @ApiProperty({ description: 'Vote value (1 for upvote, -1 for downvote)', enum: [1, -1] })
  @IsNumber()
  @IsIn([1, -1])
  @IsNotEmpty()
  vote: number;

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
  @IsOptional()
  customer_id: string;
} 