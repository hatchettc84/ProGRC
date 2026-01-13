import { Injectable, ExecutionContext, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { GameWardenJwtService } from '../services/game-warden-jwt.service';
import { GameWardenUser } from '../interfaces/game-warden.interface';

@Injectable()
export class GameWardenAuthGuard {
  private readonly logger = new Logger(GameWardenAuthGuard.name);

  constructor(
    private readonly gameWardenJwtService: GameWardenJwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Check if endpoint is marked as public
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    // Extract token from Authorization header
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.error('No Authorization header found');
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      // Validate token and extract user
      const user = await this.gameWardenJwtService.validateToken(token);
      // Attach user to request
      (request as any).user = user;
      request['gameWardenUser'] = user;

      // Check group-based authorization
      const requiredGroups = this.reflector.get<string[]>('requiredGroups', context.getHandler());
      if (requiredGroups && requiredGroups.length > 0) {
        if (!this.gameWardenJwtService.hasRequiredGroups(user, requiredGroups)) {
          this.logger.warn(`User ${user.email} lacks required groups: ${requiredGroups.join(', ')}`);
          throw new ForbiddenException('Insufficient group permissions');
        }
      }

      // Check role-based authorization
      const requiredRoles = this.reflector.get<string[]>('requiredRoles', context.getHandler());
      if (requiredRoles && requiredRoles.length > 0) {
        if (!this.gameWardenJwtService.hasRequiredRoles(user, requiredRoles)) {
          this.logger.warn(`User ${user.email} lacks required roles: ${requiredRoles.join(', ')}`);
          throw new ForbiddenException('Insufficient role permissions');
        }
      }

      this.logger.debug(`User ${user.email} authorized successfully`);
      return true;

    } catch (error) {
      this.logger.error('Authentication failed', {
        error: error.message,
        name: error.name,
      });

      // Re-throw specific exceptions
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }

      // Convert other errors to UnauthorizedException
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 