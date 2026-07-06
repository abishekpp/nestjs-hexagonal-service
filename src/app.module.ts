import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { ShutdownService } from './config/lifecycle/shutdown.service';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransmittalsModule } from './modules/transmittals/transmittals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    UsersModule,
    PrismaModule,
    TransmittalsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ShutdownService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
