import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { status, Metadata } from '@grpc/grpc-js';
import { throwError } from 'rxjs';
import { DomainException } from '../exceptions/domain.exception';
import { ApplicationException } from '../exceptions/application.exception';

type GrpcError = {
  code: status;
  message: string;
  details: string;
  metadata: Metadata;
};

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof DomainException) {
      return throwError(() =>
        this.toGrpcError(status.INVALID_ARGUMENT, exception.message, exception.errorCode),
      );
    }

    if (exception instanceof ApplicationException) {
      return throwError(() =>
        this.toGrpcError(status.INVALID_ARGUMENT, exception.message, exception.errorCode),
      );
    }

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();

      return throwError(() =>
        this.toGrpcError(
          status.INVALID_ARGUMENT,
          this.getValidationMessage(response),
          'VALIDATION_ERROR',
        ),
      );
    }

    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error(String(exception));
    }

    return throwError(() =>
      this.toGrpcError(status.INTERNAL, 'Internal server error', 'INTERNAL_SERVER_ERROR'),
    );
  }

  private toGrpcError(code: status, message: string, errorCode: string): GrpcError {
    const metadata = new Metadata();
    metadata.set('error-code', errorCode);

    return {
      code,
      message,
      details: message,
      metadata,
    };
  }

  private getValidationMessage(response: unknown): string {
    if (typeof response === 'object' && response !== null && 'message' in response) {
      const message = (response as { message: string | string[] }).message;

      if (Array.isArray(message)) {
        return message.join(', ');
      }

      return message;
    }

    return 'Validation failed';
  }
}
