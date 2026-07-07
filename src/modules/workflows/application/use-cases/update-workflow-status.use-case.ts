import { Inject, Injectable } from '@nestjs/common';
import { ApplicationException } from 'src/common/exceptions/application.exception';
import { ExceptionType } from 'src/shared/enums/exception-type.enum';
import {
  WORKFLOW_REPOSITORY_PORT,
  type WorkflowRepositoryPort,
} from '../../ports/out/workflow.repository.port';
import { UpdateWorkflowStatusInput } from '../dto/inputs/update-workflow-status.input';
import { WorkflowOutput } from '../dto/outputs/workflow.output';
import { toWorkflowOutput } from './workflow-output.mapper';

@Injectable()
export class UpdateWorkflowStatusUseCase {
  constructor(
    @Inject(WORKFLOW_REPOSITORY_PORT)
    private readonly workflowRepository: WorkflowRepositoryPort,
  ) {}

  async execute(input: UpdateWorkflowStatusInput): Promise<WorkflowOutput> {
    const workflow = await this.workflowRepository.findById(input.id);

    if (!workflow) {
      throw new ApplicationException(
        `Workflow "${input.id}" was not found`,
        'WORKFLOW_NOT_FOUND',
        ExceptionType.NOT_FOUND,
      );
    }

    if (input.status !== 'COMPLETED') {
      throw new ApplicationException(
        'Workflow status can only be updated to COMPLETED',
        'WORKFLOW_UNSUPPORTED_STATUS_UPDATE',
        ExceptionType.VALIDATION,
      );
    }

    const completedWorkflow = workflow.complete();
    const updated = await this.workflowRepository.update(completedWorkflow);

    return toWorkflowOutput(updated);
  }
}
