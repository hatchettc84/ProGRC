import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SpaRoutingGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const uri = request.url;

    // Log the incoming request
    console.log(`[SPA GUARD] Processing request: ${request.method} ${uri}`);

    // Allow all requests - the middleware will handle URL rewriting
    // and the catch-all route will handle SPA routing
    console.log(`[SPA GUARD] Allowing request: ${uri}`);
    return true;
  }
} 