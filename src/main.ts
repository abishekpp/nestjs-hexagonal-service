import { NestFactory } from '@nestjs/core';
import { bootstrapConfig } from './config/lifecycle/bootstrap-config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getGrpcPackages, getGrpcProtoPaths } from './config/grpc/grpc-contracts.config';
import { APP_NAME } from './shared/constants/app.constants';
import { GrpcExceptionFilter } from './common/filters/grpc-exception.filter';

async function bootstrap() {
  await bootstrapConfig();
  const logger: Logger = new Logger(bootstrap.name);
  const configService = new ConfigService();
  const grpcPort = configService.get<string>('GRPC_PORT', '50052');
  const url = `0.0.0.0:${grpcPort}`;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: getGrpcPackages(),
      protoPath: getGrpcProtoPaths(__dirname),
      url,
    },
  });

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GrpcExceptionFilter());
  await app.listen();

  logger.log(`${APP_NAME} is listening on ${url}`);
}
bootstrap();
