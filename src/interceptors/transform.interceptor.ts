import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { StandardResponse } from "../common/dto/standardResponse.dto";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
export class TransformInterceptor<T = any> implements NestInterceptor<T, StandardResponse<T>> {
    constructor(private readonly logger: LoggerService) { }
    intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
        return next.handle().pipe(
            map(data => {
                if (data instanceof StandardResponse) {
                    const response = context.switchToHttp().getResponse();
                    response.status(parseInt(data.code));
                    return data;
                }
                return StandardResponse.success('Success', data);
            }),
            catchError(err => {
                if (err instanceof HttpException) {
                    const status = err.getStatus();
                    const errorResponse = err.getResponse();
                    const message = this.getErrorMessage(errorResponse);

                    return throwError(() => new HttpException(
                        StandardResponse.error(message, status.toString(), err.message),
                        status
                    ));
                } else if (err instanceof EntityNotFoundError) {
                    return throwError(() => new HttpException(
                        StandardResponse.notFound('Resource not found'),
                        HttpStatus.NOT_FOUND
                    ));
                } else {
                    this.logger.error(err);
                    return throwError(() => new HttpException(
                        StandardResponse.serverError('An unexpected error occurred', err.message),
                        HttpStatus.INTERNAL_SERVER_ERROR
                    ));
                }
            })
        );
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) return error.message;
        if (typeof error === 'string') return error;
        if (typeof error === 'object' && error !== null) {
            // Check if the error has a 'message' property that is an array
            if ('message' in error && Array.isArray((error as any).message)) {
                return (error as any).message.join(', ');
            }

            // Check if the error has a single 'message' property
            if ('message' in error && typeof (error as any).message === 'string') {
                return (error as any).message;
            }
        }
        return 'An error occurred';
    }
}
