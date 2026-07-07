import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { CreateWorkflowUseCase } from '../../../../application/use-cases/create-workflow.use-case';
import { ListWorkflowsUseCase } from '../../../../application/use-cases/list-workflows.use-case';
import { UpdateWorkflowStatusUseCase } from '../../../../application/use-cases/update-workflow-status.use-case';
import { WorkflowOutput } from '../../../../application/dto/outputs/workflow.output';
import { CreateWorkflowGrpcRequestDto } from '../dto/create-workflow-grpc.request';
import { UpdateWorkflowStatusGrpcRequestDto } from '../dto/update-workflow-status-grpc.request';

@Controller()
export class WorkflowsGrpcController {
  constructor(
    private readonly createWorkflowUseCase: CreateWorkflowUseCase,
    private readonly listWorkflowsUseCase: ListWorkflowsUseCase,
    private readonly updateWorkflowStatusUseCase: UpdateWorkflowStatusUseCase,
  ) {}

  @GrpcMethod('WorkflowService', 'CreateWorkflow')
  async createWorkflow(@Payload() data: CreateWorkflowGrpcRequestDto) {
    const workflow = await this.createWorkflowUseCase.execute({
      projectId: data.projectId,
      subject: data.subject,
      documentIds: data.documentIds ?? [],
      recipientIds: data.recipientIds ?? [],
      dueDate: data.dueDate || undefined,
      remarks: data.remarks || undefined,
      createdBy: data.createdBy,
    });

    return this.toGrpcResponse(workflow);
  }

  @GrpcMethod('WorkflowService', 'ListWorkflows')
  async listWorkflows() {
    const workflows = await this.listWorkflowsUseCase.execute();

    return {
      workflows: workflows.map((workflow) => this.toGrpcResponse(workflow)),
    };
  }

  @GrpcMethod('WorkflowService', 'UpdateWorkflowStatus')
  async updateWorkflowStatus(@Payload() data: UpdateWorkflowStatusGrpcRequestDto) {
    const workflow = await this.updateWorkflowStatusUseCase.execute({
      id: data.id,
      status: data.status,
    });

    return this.toGrpcResponse(workflow);
  }

  private toGrpcResponse(workflow: WorkflowOutput) {
    return {
      id: workflow.id,
      projectId: workflow.projectId,
      subject: workflow.subject,
      documentIds: workflow.documentIds,
      recipientIds: workflow.recipientIds,
      status: workflow.status,
      dueDate: workflow.dueDate ?? '',
      remarks: workflow.remarks ?? '',
      createdBy: workflow.createdBy,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      completedAt: workflow.completedAt ?? '',
      transmittalId: workflow.transmittalId ?? '',
      transmittalNumber: workflow.transmittalNumber ?? '',
    };
  }
}
