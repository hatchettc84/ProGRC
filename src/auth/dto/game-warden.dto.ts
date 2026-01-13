import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class ValidateTokenDto {
  @ApiProperty({
    description: 'JWT token to validate',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;
}

export class UserProfileDto {
  @ApiProperty({
    description: 'Unique user identifier (sub from JWT)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'User group memberships',
    example: ['/Customers/mycompany/developers', '/Customers/mycompany/admins'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  groups: string[];

  @ApiProperty({
    description: 'User roles',
    example: ['user', 'developer', 'admin'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @ApiProperty({
    description: 'Whether email is verified',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiProperty({
    description: 'Whether user has admin privileges',
    example: false,
  })
  @IsBoolean()
  isAdmin: boolean;
}

export class GroupInfoDto {
  @ApiProperty({
    description: 'All user groups',
    example: ['/Customers/mycompany/developers', '/Customers/mycompany/admins'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  userGroups: string[];

  @ApiProperty({
    description: 'Groups matching specific pattern',
    example: ['/Customers/mycompany/developers'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  matchingGroups: string[];

  @ApiProperty({
    description: 'Whether user has required groups',
    example: true,
  })
  @IsBoolean()
  hasRequiredGroups: boolean;
}

export class CustomerGroupsDto {
  @ApiProperty({
    description: 'Customer-specific groups',
    example: ['/Customers/mycompany/developers', '/Customers/mycompany/admins'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  customerGroups: string[];
}

export class TokenValidationResponseDto {
  @ApiProperty({
    description: 'Whether token is valid',
    example: true,
  })
  @IsBoolean()
  valid: boolean;

  @ApiProperty({
    description: 'User information from token (if valid)',
    type: UserProfileDto,
    required: false,
  })
  @IsOptional()
  user?: UserProfileDto;
}

export class PublicInfoDto {
  @ApiProperty({
    description: 'Public message',
    example: 'This is public information available to everyone',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Timestamp of the response',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsString()
  timestamp: string;
}

export class AdminMessageDto {
  @ApiProperty({
    description: 'Admin welcome message',
    example: 'Welcome, John Doe! You have admin privileges.',
  })
  @IsString()
  message: string;
} 