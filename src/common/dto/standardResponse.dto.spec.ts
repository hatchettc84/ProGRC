import { StandardResponse } from "./standardResponse.dto";

describe('StandardResponse', () => {
    describe('success', () => {
        it('should create a success response', () => {
            const response = StandardResponse.success('Success', { id: 1 });
            expect(response).toEqual({
                code: '200',
                message: 'Success',
                data: { id: 1 },
                error: undefined
            });
        });

        it('should create a success response without data', () => {
            const response = StandardResponse.success('Success');
            expect(response).toEqual({
                code: '200',
                message: 'Success',
                data: undefined,
                error: undefined
            });
        });

        it('should create a success response with total', () => {
            const response = StandardResponse.successWithTotal('Success', [{ id: 1 }], { total: 1, limit: 5, offset: 0 });
            expect(response).toEqual({
                code: '200',
                message: 'Success',
                data: [{ id: 1 }],
                error: undefined,
                meta: { total: 1, limit: 5, offset: 0 }
            });
        });
    });

    describe('error', () => {
        it('should create an error response', () => {
            const response = StandardResponse.error('Operation failed', '400', 'Error details');
            expect(response).toEqual({
                code: '400',
                message: 'Operation failed',
                data: undefined,
                error: 'Error details'
            });
        });

        it('should create an error response with default status code', () => {
            const response = StandardResponse.error('Operation failed');
            expect(response).toEqual({
                code: '400',
                message: 'Operation failed',
                data: undefined,
                error: undefined
            });
        });
    });

    describe('notFound', () => {
        it('should create a not found response', () => {
            const response = StandardResponse.notFound();
            expect(response).toEqual({
                code: '404',
                message: 'Not Found',
                data: undefined,
                error: undefined
            });
        });

        it('should create a not found response with custom message', () => {
            const response = StandardResponse.notFound('Custom not found message');
            expect(response).toEqual({
                code: '404',
                message: 'Custom not found message',
                data: undefined,
                error: undefined
            });
        });
    });

    describe('serverError', () => {
        it('should create a server error response', () => {
            const response = StandardResponse.serverError();
            expect(response).toEqual({
                code: '500',
                message: 'Internal Server Error',
                data: undefined,
                error: undefined
            });
        });

        it('should create a server error response with custom message and error', () => {
            const response = StandardResponse.serverError('Custom server error', 'Error details');
            expect(response).toEqual({
                code: '500',
                message: 'Custom server error',
                data: undefined,
                error: 'Error details'
            });
        });
    });
});
