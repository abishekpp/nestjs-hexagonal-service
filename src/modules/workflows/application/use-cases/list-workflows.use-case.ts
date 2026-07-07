import { Inject, Injectable } from '@nestjs/common';
import {
  WORKFLOW_REPOSITORY_PORT,
  type WorkflowRepositoryPort,
} from '../../ports/out/workflow.repository.port';
import { WorkflowOutput } from '../dto/outputs/workflow.output';
import { toWorkflowOutput } from './workflow-output.mapper';

@Injectable()
export class ListWorkflowsUseCase {
  constructor(
    @Inject(WORKFLOW_REPOSITORY_PORT)
    private readonly workflowRepository: WorkflowRepositoryPort,
  ) {}

  async execute(): Promise<WorkflowOutput[]> {
    const workflows = await this.workflowRepository.findAll();

    return workflows.map(toWorkflowOutput);
  }
}
