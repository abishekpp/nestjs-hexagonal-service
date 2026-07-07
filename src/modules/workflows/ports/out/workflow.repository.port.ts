import { Workflow } from '../../domain/entities/workflow.entity';

export const WORKFLOW_REPOSITORY_PORT = Symbol('WORKFLOW_REPOSITORY_PORT');

export interface WorkflowRepositoryPort {
  create(workflow: Workflow): Promise<Workflow>;
  findAll(): Promise<Workflow[]>;
  findById(id: string): Promise<Workflow | null>;
  update(workflow: Workflow): Promise<Workflow>;
}
