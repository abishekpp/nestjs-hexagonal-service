import { NestFactory } from '@nestjs/core';
import { bootstrapConfig } from './config/lifecycle/bootstrap-config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { getGrpcPackages, getGrpcProtoPaths } from './config/grpc-contracts.config';

async function bootstrap() {
  await bootstrapConfig();
  const logger: Logger = new Logger(bootstrap.name);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: getGrpcPackages(),
      protoPath: getGrpcProtoPaths(__dirname),
      url: process.env.GRPC_URL ?? '0.0.0.0:50052',
    },
  });

  await app.listen();

  logger.log(`gRPC microservice is listening on ${process.env.GRPC_URL ?? '0.0.0.0:50052'}`);
}
bootstrap();
