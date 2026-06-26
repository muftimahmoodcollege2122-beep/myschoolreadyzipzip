"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const correlationId = request.headers['x-correlation-id'];
        const { statusCode, message, error } = this.resolveError(exception);
        this.logger.error(`[${correlationId}] ${request.method} ${request.url} → ${statusCode}`, exception instanceof Error ? exception.stack : String(exception));
        const body = {
            statusCode,
            message,
            error,
            correlationId,
            timestamp: new Date().toISOString(),
        };
        response.status(statusCode).json(body);
    }
    resolveError(exception) {
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const resp = exceptionResponse;
                return {
                    statusCode: status,
                    message: resp.message || exception.message,
                    error: resp.error || common_1.HttpStatus[status],
                };
            }
            return {
                statusCode: status,
                message: exception.message,
                error: common_1.HttpStatus[status] || 'Error',
            };
        }
        if (exception instanceof client_1.PrismaClientKnownRequestError) {
            return this.handlePrismaError(exception);
        }
        if (exception instanceof client_1.PrismaClientValidationError) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'Invalid request data',
                error: 'Bad Request',
            };
        }
        return {
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'An unexpected error occurred',
            error: 'Internal Server Error',
        };
    }
    handlePrismaError(err) {
        switch (err.code) {
            case 'P2002':
                return {
                    statusCode: common_1.HttpStatus.CONFLICT,
                    message: 'A record with this value already exists',
                    error: 'Conflict',
                };
            case 'P2025':
                return {
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                    message: 'Record not found',
                    error: 'Not Found',
                };
            case 'P2003':
                return {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Related record not found',
                    error: 'Bad Request',
                };
            case 'P2034':
                return {
                    statusCode: common_1.HttpStatus.CONFLICT,
                    message: 'Transaction conflict, please retry',
                    error: 'Conflict',
                };
            default:
                return {
                    statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Database operation failed',
                    error: 'Internal Server Error',
                };
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map