import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { camelCase, mapKeys } from 'lodash';
import { Observable } from 'rxjs';

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // Convert snake_case to camelCase for the request body
        if (request.body) {
            request.body = this.convertToCamelCase(request.body);
        }

        return next.handle();
    }

    // Utility function to recursively convert all object keys to camelCase
    private convertToCamelCase(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map((v) => this.convertToCamelCase(v));
        } else if (obj !== null && obj.constructor === Object) {
            return mapKeys(obj, (value, key) => camelCase(key));
        }
        return obj;
    }
}
