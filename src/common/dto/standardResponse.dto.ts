interface Meta {
    total: number;
    limit?: number;
    offset?: number;
}

export class StandardResponse<T = any> {
    code: string;
    message: string;
    data?: T;
    error?: string;
    meta?: Meta;

    constructor(code: string, message: string, data?: T, error?: string, meta?: Meta) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.error = error;
        this.meta = meta;
    }

    static success<T>(message: string, data?: T, code?: string): StandardResponse<T> {
        const statusCode = code || "200";
        return new StandardResponse<T>(statusCode, message, data);
    }

    static successWithTotal<T>(message: string, data: T, total: Meta): StandardResponse<T> {
        return new StandardResponse<T>("200", message, data, undefined, total);
    }

    static error<T>(message: string, code: string = "400", error?: string): StandardResponse<T> {
        return new StandardResponse<T>(code, message, undefined, error);
    }

    static notFound<T>(message: string = "Not Found"): StandardResponse<T> {
        return new StandardResponse<T>("404", message);
    }

    static serverError<T>(message: string = "Internal Server Error", error?: string): StandardResponse<T> {
        return new StandardResponse<T>("500", message, undefined, error);
    }
}
