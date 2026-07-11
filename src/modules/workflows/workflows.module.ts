import { Module } from '@nestjs/common';
import { PrismaModule } from '@infra/database/prisma/prisma.module';
import { TransmittalsModule } from '../transmittals/transmittals.module';
import { WorkflowsGrpcController } from './adapters/in/grpc/controllers/workflows-grpc.controller';
import { PrismaWorkflowRepositoryAdapter } from './adapters/out/persistence/prisma-workflow.repository.adapter';
import { TransmittalModuleAdapter } from './adapters/out/transmittals/transmittal-module.adapter';
import { CreateWorkflowUseCase } from './application/use-cases/create-workflow.use-case';
import { ListWorkflowsUseCase } from './application/use-cases/list-workflows.use-case';
import { UpdateWorkflowStatusUseCase } from './application/use-cases/update-workflow-status.use-case';
import { WORKFLOW_REPOSITORY_PORT } from './ports/out/workflow.repository.port';
import { WORKFLOW_TRANSMITTAL_PORT } from './ports/out/workflow-transmittal.port';

@Module({
  imports: [PrismaModule, TransmittalsModule],
  controllers: [WorkflowsGrpcController],
  providers: [
    CreateWorkflowUseCase,
    ListWorkflowsUseCase,
    UpdateWorkflowStatusUseCase,
    {
      provide: WORKFLOW_REPOSITORY_PORT,
      useClass: PrismaWorkflowRepositoryAdapter,
    },
    {
      provide: WORKFLOW_TRANSMITTAL_PORT,
      useClass: TransmittalModuleAdapter,
    },
  ],
})
export class WorkflowsModule {}
