import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule } from '@nestjs/config';
import { ShutdownService } from './config/lifecycle/shutdown.service';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { TransmittalsModule } from './modules/transmittals/transmittals.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    PrismaModule,
    TransmittalsModule,
    WorkflowsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ShutdownService],
})
export class AppModule {}
