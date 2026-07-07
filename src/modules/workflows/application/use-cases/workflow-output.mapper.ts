import { Workflow } from '../../domain/entities/workflow.entity';
import { WorkflowOutput } from '../dto/outputs/workflow.output';

export function toWorkflowOutput(workflow: Workflow): WorkflowOutput {
  return {
    id: workflow.id,
    projectId: workflow.projectId,
    subject: workflow.subject,
    documentIds: workflow.documentIds,
    recipientIds: workflow.recipientIds,
    status: workflow.status,
    dueDate: workflow.dueDate ?? undefined,
    remarks: workflow.remarks ?? undefined,
    createdBy: workflow.createdBy,
    createdAt: workflow.createdAt.toISOString(),
    updatedAt: workflow.updatedAt.toISOString(),
    completedAt: workflow.completedAt?.toISOString(),
    transmittalId: workflow.transmittalId ?? undefined,
    transmittalNumber: workflow.transmittalNumber ?? undefined,
  };
}
