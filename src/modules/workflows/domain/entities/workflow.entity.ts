import { randomUUID } from 'node:crypto';
import { WorkflowDomainException } from '../exceptions/workflow-domain.exception';

export type WorkflowStatus = 'IN_PROGRESS' | 'COMPLETED';

export class Workflow {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly subject: string,
    public readonly documentIds: string[],
    public readonly recipientIds: string[],
    public readonly status: WorkflowStatus,
    public readonly dueDate: string | null,
    public readonly remarks: string | null,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly completedAt: Date | null,
    public readonly transmittalId: string | null,
    public readonly transmittalNumber: string | null,
  ) {}

  static create(params: {
    projectId: string;
    subject: string;
    documentIds: string[];
    recipientIds: string[];
    dueDate?: string;
    remarks?: string;
    createdBy: string;
  }): Workflow {
    Workflow.validateRequiredFields(params);

    const now = new Date();

    return new Workflow(
      randomUUID(),
      params.projectId.trim(),
      params.subject.trim(),
      params.documentIds,
      params.recipientIds,
      'IN_PROGRESS',
      params.dueDate ?? null,
      params.remarks?.trim() || null,
      params.createdBy.trim(),
      now,
      now,
      null,
      null,
      null,
    );
  }

  complete(params: { transmittalId: string; transmittalNumber: string }): Workflow {
    if (this.status !== 'IN_PROGRESS') {
      throw new WorkflowDomainException(
        'Only in-progress workflows can be completed',
        'WORKFLOW_INVALID_STATUS_TRANSITION',
      );
    }

    if (!params.transmittalId?.trim()) {
      throw new WorkflowDomainException(
        'Transmittal id is required to complete workflow',
        'WORKFLOW_TRANSMITTAL_ID_REQUIRED',
      );
    }

    if (!params.transmittalNumber?.trim()) {
      throw new WorkflowDomainException(
        'Transmittal number is required to complete workflow',
        'WORKFLOW_TRANSMITTAL_NUMBER_REQUIRED',
      );
    }

    const now = new Date();

    return new Workflow(
      this.id,
      this.projectId,
      this.subject,
      this.documentIds,
      this.recipientIds,
      'COMPLETED',
      this.dueDate,
      this.remarks,
      this.createdBy,
      this.createdAt,
      now,
      now,
      params.transmittalId.trim(),
      params.transmittalNumber.trim(),
    );
  }

  private static validateRequiredFields(params: {
    projectId: string;
    subject: string;
    documentIds: string[];
    recipientIds: string[];
    createdBy: string;
  }): void {
    if (!params.projectId?.trim()) {
      throw new WorkflowDomainException('Project id is required', 'WORKFLOW_PROJECT_ID_REQUIRED');
    }

    if (!params.subject?.trim()) {
      throw new WorkflowDomainException('Subject is required', 'WORKFLOW_SUBJECT_REQUIRED');
    }

    if (!params.documentIds?.length) {
      throw new WorkflowDomainException(
        'At least one document is required',
        'WORKFLOW_DOCUMENTS_REQUIRED',
      );
    }

    if (!params.recipientIds?.length) {
      throw new WorkflowDomainException(
        'At least one recipient is required',
        'WORKFLOW_RECIPIENTS_REQUIRED',
      );
    }

    if (!params.createdBy?.trim()) {
      throw new WorkflowDomainException('Created by is required', 'WORKFLOW_CREATED_BY_REQUIRED');
    }
  }
}
