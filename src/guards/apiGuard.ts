import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class XApiKeyGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const apiKey = request.header('x-api-key');

        // Check if API key is provided
        if (!apiKey) {
            throw new UnauthorizedException('X-API-Key header is missing');
        }

        // Get API key from environment variables
        const validApiKey = this.configService.get<string>('INTERNAL_API_KEY');

        // Verify if API key is valid
        if (!validApiKey || apiKey !== validApiKey) {
            throw new UnauthorizedException('Invalid X-API-Key');
        }

        return true;
    }
}
