import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GameWardenUser } from '../interfaces/game-warden.interface';

// Metadata keys
export const IS_PUBLIC_KEY = 'isPublic';
export const REQUIRED_GROUPS_KEY = 'requiredGroups';
export const REQUIRED_ROLES_KEY = 'requiredRoles';

// Public endpoint decorator
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Group-based authorization decorator
export const RequireGroups = (...groups: string[]) => SetMetadata(REQUIRED_GROUPS_KEY, groups);

// Role-based authorization decorator
export const RequireRoles = (...roles: string[]) => SetMetadata(REQUIRED_ROLES_KEY, roles);

// User extraction decorator
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): GameWardenUser => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.gameWardenUser || request.user;
    
    if (!user) {
      throw new Error('User not found in request. Make sure GameWardenAuthGuard is applied.');
    }
    
    return user;
  },
);

// Admin check decorator
export const RequireAdmin = () => SetMetadata(REQUIRED_ROLES_KEY, ['admin', 'administrator', 'super-admin']); 