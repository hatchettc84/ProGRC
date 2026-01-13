import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlatformOneStateResponseDto {
  @ApiProperty({ description: 'Cryptographically secure state parameter' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Unique session identifier' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}

export class PlatformOneCallbackDto {
  @ApiProperty({ description: 'Authorization code from Platform One' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'State parameter for CSRF protection' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Session identifier' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}

export class PlatformOneTokenResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({ description: 'Token expiration in seconds' })
  @IsString()
  @IsNotEmpty()
  expiresIn: number;

  @ApiProperty({ description: 'User information' })
  @IsNotEmpty()
  user: {
    id: string;
    email: string;
    name: string;
    groups: string[];
  };
} 