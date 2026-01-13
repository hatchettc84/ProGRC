import { CallHandler, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { StandardResponse } from "../common/dto/standardResponse.dto";
import { TransformInterceptor } from "./transform.interceptor";

describe('TransformInterceptor', () => {
    let interceptor: TransformInterceptor;
    let executionContext: ExecutionContext;
    let next: CallHandler;

    beforeEach(() => {
        interceptor = new TransformInterceptor();
        executionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getResponse: jest.fn().mockReturnValue({
                    status: jest.fn(),
                }),
            }),
        } as unknown as ExecutionContext;
    });

    it('should wrap non-StandardResponse data in a success StandardResponse', (done) => {
        next = {
            handle: () => of({ someData: 'test' }),
        } as CallHandler;

        interceptor.intercept(executionContext, next).subscribe(
            (result) => {
                expect(result).toBeInstanceOf(StandardResponse);
                expect(result.code).toBe("200");
                expect(result.data).toEqual({ someData: 'test' });
                done();
            }
        );
    });

    it('should pass through StandardResponse data unchanged', (done) => {
        const originalResponse = StandardResponse.success('Test', { someData: 'test' });
        next = {
            handle: () => of(originalResponse),
        } as CallHandler;

        interceptor.intercept(executionContext, next).subscribe(
            (result) => {
                expect(result).toBe(originalResponse);
                done();
            }
        );
    });

    describe('handle HttpException', () => {
        it('return StandardResponse error when HttpException.getResponse() is string', (done) => {
            const httpException = new HttpException('Test error', HttpStatus.BAD_REQUEST);
            next = {
                handle: () => throwError(() => httpException),
            } as CallHandler;

            interceptor.intercept(executionContext, next).subscribe(
                () => {
                    done.fail('Should not succeed');
                },
                (error) => {
                    expect(error).toBeInstanceOf(HttpException);
                    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
                    const response = error.getResponse() as StandardResponse;
                    expect(response).toBeInstanceOf(StandardResponse);
                    expect(response.code).toBe("400");
                    expect(response.message).toBe('Test error');
                    done();
                }
            );
        });

        it('return StandardResponse error when HttpException.getResponse() is instanceof error', (done) => {
            const httpException = new HttpException(new Error('Test error'), HttpStatus.BAD_REQUEST);
            next = {
                handle: () => throwError(() => httpException),
            } as CallHandler;

            interceptor.intercept(executionContext, next).subscribe(
                () => {
                    done.fail('Should not succeed');
                },
                (error) => {
                    expect(error).toBeInstanceOf(HttpException);
                    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
                    const response = error.getResponse() as StandardResponse;
                    expect(response).toBeInstanceOf(StandardResponse);
                    expect(response.code).toBe("400");
                    expect(response.message).toBe('Test error');
                    done();
                }
            );
        });

        it('return StandardResponse error when HttpException.getResponse() is have object with error message', (done) => {
            const httpException = new HttpException({
                message: 'Test error',
                errorCode: 'OBJECT_ERROR',
            }, HttpStatus.BAD_REQUEST);
            next = {
                handle: () => throwError(() => httpException),
            } as CallHandler;

            interceptor.intercept(executionContext, next).subscribe(
                () => {
                    done.fail('Should not succeed');
                },
                (error) => {
                    expect(error).toBeInstanceOf(HttpException);
                    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
                    const response = error.getResponse() as StandardResponse;
                    expect(response).toBeInstanceOf(StandardResponse);
                    expect(response.code).toBe("400");
                    expect(response.message).toBe('Test error');
                    done();
                }
            );
        });

        it('return StandardResponse error with default error message when HttpException.getResponse() is unexpected object', (done) => {
            const httpException = new HttpException({
                errorCode: 'OBJECT_ERROR',
            }, HttpStatus.BAD_REQUEST);
            next = {
                handle: () => throwError(() => httpException),
            } as CallHandler;

            interceptor.intercept(executionContext, next).subscribe(
                () => {
                    done.fail('Should not succeed');
                },
                (error) => {
                    expect(error).toBeInstanceOf(HttpException);
                    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
                    const response = error.getResponse() as StandardResponse;
                    expect(response).toBeInstanceOf(StandardResponse);
                    expect(response.code).toBe("400");
                    expect(response.message).toBe('An error occurred');
                    done();
                }
            );
        });
    });

    it('should handle typeorm EntityNotFoundError', (done) => {
        const httpException = new EntityNotFoundError('EntityName', 'Entity not found');
        next = {
            handle: () => throwError(() => httpException),
        } as CallHandler;

        interceptor.intercept(executionContext, next).subscribe(
            () => {
                done.fail('Should not succeed');
            },
            (error) => {
                expect(error).toBeInstanceOf(HttpException);
                expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
                const response = error.getResponse() as StandardResponse;
                expect(response).toBeInstanceOf(StandardResponse);
                expect(response.code).toBe("404");
                expect(response.message).toBe('Resource not found');
                done();
            }
        );
    });

    it('should handle unexpected errors and return StandardResponse error', (done) => {
        const unexpectedError = new Error('Unexpected error');
        next = {
            handle: () => throwError(() => unexpectedError),
        } as CallHandler;

        interceptor.intercept(executionContext, next).subscribe(
            () => {
                done.fail('Should not succeed');
            },
            (error) => {
                expect(error).toBeInstanceOf(HttpException);
                expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
                const response = error.getResponse() as StandardResponse;
                expect(response).toBeInstanceOf(StandardResponse);
                expect(response.code).toBe("500");
                expect(response.message).toBe('An unexpected error occurred');
                expect(response.error).toBe('Unexpected error');
                done();
            }
        );
    });
});
