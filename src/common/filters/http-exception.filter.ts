import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from 'src/shared/interfaces/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode: number = this.getStatusCode(exception);
    const exceptionResponse = this.getExceptionResponse(exception);

    const errorResponse: ErrorResponseDto = {
      success: false,
      statusCode,
      message: this.getMessage(exceptionResponse),
      errorCode: this.getErrorCode(exceptionResponse, statusCode),
      details: this.getDetails(exceptionResponse),
    };

    if (statusCode >= 500) {
      const errorCode = `${request.method} ${request.url} - ${statusCode}`;
      const errorMsg = exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(errorCode, errorMsg);
    }

    response.status(statusCode).json(errorResponse);
  }

  // Private methods
  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getExceptionResponse(exception: unknown): unknown {
    if (exception instanceof HttpException) {
      return exception.getResponse();
    }

    return {
      message: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR',
    };
  }

  private getMessage(exceptionResponse: unknown): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      return (exceptionResponse as { message: string | string[] }).message;
    }

    return 'Internal server error';
  }

  private getErrorCode(exceptionResponse: unknown, statusCode: number): string {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'errorCode' in exceptionResponse
    ) {
      return (exceptionResponse as { errorCode: string }).errorCode;
    }

    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }

  private getDetails(exceptionResponse: unknown): unknown {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'details' in exceptionResponse
    ) {
      return (exceptionResponse as { details: unknown }).details;
    }

    return undefined;
  }
}
