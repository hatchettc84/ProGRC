import { IsString, IsOptional, IsEnum, IsArray, IsObject, MaxLength, IsEmail, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VendorStatus, VendorRiskLevel } from 'src/entities/vendor.entity';

export class CreateVendorDto {
  @ApiProperty({ description: 'Vendor name', example: 'Acme Corporation' })
  @IsString()
  @MaxLength(255)
  vendorName: string;

  @ApiPropertyOptional({ description: 'Vendor description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Contact email', example: 'contact@acme.com' })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Website URL', example: 'https://www.acme.com' })
  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Industry sector', example: 'Technology' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ description: 'Vendor type', example: 'software' })
  @IsString()
  @IsOptional()
  vendorType?: string;

  @ApiPropertyOptional({ description: 'Initial status', enum: VendorStatus, default: VendorStatus.PENDING })
  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;

  @ApiPropertyOptional({ description: 'Risk level', enum: VendorRiskLevel })
  @IsEnum(VendorRiskLevel)
  @IsOptional()
  riskLevel?: VendorRiskLevel;

  @ApiPropertyOptional({ description: 'Compliance certifications', type: [String], example: ['SOC2', 'ISO27001'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  complianceCertifications?: string[];

  @ApiPropertyOptional({ description: 'Contract details', type: Object })
  @IsObject()
  @IsOptional()
  contractDetails?: Record<string, any>;
}

