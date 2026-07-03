import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { ConfigService } from '@nestjs/config';
import { bootstrapConfig } from './config/lifecycle/bootstrap-config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  await bootstrapConfig();
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'nest-boilerplate',
      logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
      timestamp: true,
      colors: true,
    }),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const requestBodyLimit = configService.get<string>('REQUEST_BODY_LIMIT') || '10mb';
  const corsOrigins = configService.get<string>('CORS_ORIGINS') || '';

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  // Global prefix with exclusion for health checks
  app.setGlobalPrefix('api', { exclude: ['health'] });

  // Api versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Security middlewares
  app.use(helmet({ crossOriginResourcePolicy: false }));

  // Body parsing with size limits
  app.use(json({ limit: requestBodyLimit }));
  app.use(urlencoded({ extended: true, limit: requestBodyLimit }));

  // CORS configuration from environment variable
  const options = {
    origin: corsOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    headers: 'Content-Type, Authorization , Accept , X-Requested-With ',
  };
  app.enableCors(options);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EDMS API')
    .setDescription('API documentation for EDMS backend')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const swaggerDocumentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, swaggerDocumentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Start the server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}
bootstrap();
