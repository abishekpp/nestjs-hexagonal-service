import { randomUUID } from 'node:crypto';

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
      throw new Error('Project id is required');
    }

    if (!params.subject?.trim()) {
      throw new Error('Transmittal subject is required');
    }

    if (!params.documentIds?.length) {
      throw new Error('At least one document is required');
    }

    if (!params.recipientIds?.length) {
      throw new Error('At least one recipient is required');
    }

    if (!params.createdBy?.trim()) {
      throw new Error('Created by is required');
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
