import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { DomainException } from '../exceptions/domain.exception';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { status } from '@grpc/grpc-js';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(GrpcExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof DomainException) {
      return throwError(
        () =>
          new RpcException({
            code: status.INVALID_ARGUMENT,
            message: exception.message,
            errorCode: exception.code,
          }),
      );
    }

    if (exception instanceof RpcException) {
      return throwError(() => exception);
    }

    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error(String(exception));
    }

    return throwError(
      () =>
        new RpcException({
          code: status.INTERNAL,
          message: 'Internal server error',
          errorCode: 'INTERNAL_SERVER_ERROR',
        }),
    );
  }
}
