import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/database/prisma/prisma.module';
import { WorkflowsGrpcController } from './adapters/in/grpc/controllers/workflows-grpc.controller';
import { PrismaWorkflowRepositoryAdapter } from './adapters/out/persistence/prisma/prisma-workflow.repository.adapter';
import { CreateWorkflowUseCase } from './application/use-cases/create-workflow.use-case';
import { ListWorkflowsUseCase } from './application/use-cases/list-workflows.use-case';
import { UpdateWorkflowStatusUseCase } from './application/use-cases/update-workflow-status.use-case';
import { WORKFLOW_REPOSITORY_PORT } from './ports/out/workflow.repository.port';

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowsGrpcController],
  providers: [
    CreateWorkflowUseCase,
    ListWorkflowsUseCase,
    UpdateWorkflowStatusUseCase,
    {
      provide: WORKFLOW_REPOSITORY_PORT,
      useClass: PrismaWorkflowRepositoryAdapter,
    },
  ],
})
export class WorkflowsModule {}
