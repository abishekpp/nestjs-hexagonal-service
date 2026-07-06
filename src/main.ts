import { NestFactory } from '@nestjs/core';
import { bootstrapConfig } from './config/lifecycle/bootstrap-config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { getGrpcPackages, getGrpcProtoPaths } from './config/grpc-contracts.config';
import { APP_NAME } from './shared/constants/app.constants';
import { GrpcExceptionFilter } from './common/filters/grpc-exception.filter';

async function bootstrap() {
  await bootstrapConfig();
  const logger: Logger = new Logger(bootstrap.name);
  const GRPC_PORT = process.env.GRPC_PORT ?? '50052';
  const url = `0.0.0.0:${GRPC_PORT}`;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: getGrpcPackages(),
      protoPath: getGrpcProtoPaths(__dirname),
      url,
    },
  });

  app.useGlobalFilters(new GrpcExceptionFilter());
  await app.listen();

  logger.log(`${APP_NAME} is listening on ${url}`);
}
bootstrap();
