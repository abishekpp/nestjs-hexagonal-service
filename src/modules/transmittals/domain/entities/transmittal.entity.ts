import { randomUUID } from 'node:crypto';
import { TransmittalDomainException } from '../exceptions/transmittal-domain.exception';

export type TransmittalStatus = 'DRAFT' | 'ISSUED' | 'CLOSED';

export class Transmittal {
  constructor(
    public readonly id: string,
    public readonly transmittalNumber: string,
    public readonly projectId: string,
    public readonly subject: string,
    public readonly documentIds: string[],
    public readonly recipientIds: string[],
    public readonly status: TransmittalStatus,
    public readonly dueDate: string | null,
    public readonly remarks: string | null,
    public readonly createdBy: string,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    projectId: string;
    subject: string;
    documentIds: string[];
    recipientIds: string[];
    dueDate?: string;
    remarks?: string;
    createdBy: string;
  }): Transmittal {
    if (!params.projectId?.trim()) {
      throw new TransmittalDomainException('Project id is required', 'PROJECT_ID_REQUIRED');
    }

    if (!params.subject?.trim()) {
      throw new TransmittalDomainException('Subject is required', 'SUBJECT_REQUIRED');
    }

    if (!params.documentIds?.length) {
      throw new TransmittalDomainException(
        'At least one document is required',
        'DOCUMENTS_REQUIRED',
      );
    }

    if (!params.recipientIds?.length) {
      throw new TransmittalDomainException(
        'At least one recipient is required',
        'RECIPIENTS_REQUIRED',
      );
    }

    if (!params.createdBy?.trim()) {
      throw new TransmittalDomainException('Created by is required', 'CREATED_BY_REQUIRED');
    }

    return new Transmittal(
      randomUUID(),
      `TRN-${Date.now()}`,
      params.projectId,
      params.subject.trim(),
      params.documentIds,
      params.recipientIds,
      'DRAFT',
      params.dueDate ?? null,
      params.remarks ?? null,
      params.createdBy,
      new Date(),
    );
  }
}
