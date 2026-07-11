import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Workflow, WorkflowStatus } from '@modules/workflows/domain/entities/workflow.entity';
import { WorkflowRepositoryPort } from '@modules/workflows/ports/out/workflow.repository.port';

@Injectable()
export class PrismaWorkflowRepositoryAdapter implements WorkflowRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(workflow: Workflow): Promise<Workflow> {
    const created = await this.prisma.workflow.create({
      data: {
        id: workflow.id,
        projectId: workflow.projectId,
        subject: workflow.subject,
        documentIds: workflow.documentIds,
        recipientIds: workflow.recipientIds,
        status: workflow.status,
        dueDate: workflow.dueDate,
        remarks: workflow.remarks,
        createdBy: workflow.createdBy,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        completedAt: workflow.completedAt,
        transmittalId: workflow.transmittalId,
        transmittalNumber: workflow.transmittalNumber,
      },
    });

    return this.toDomain(created);
  }

  async findAll(): Promise<Workflow[]> {
    const rows = await this.prisma.workflow.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Workflow | null> {
    const row = await this.prisma.workflow.findUnique({
      where: { id },
    });

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async update(workflow: Workflow): Promise<Workflow> {
    const updated = await this.prisma.workflow.update({
      where: { id: workflow.id },
      data: {
        projectId: workflow.projectId,
        subject: workflow.subject,
        documentIds: workflow.documentIds,
        recipientIds: workflow.recipientIds,
        status: workflow.status,
        dueDate: workflow.dueDate,
        remarks: workflow.remarks,
        createdBy: workflow.createdBy,
        updatedAt: workflow.updatedAt,
        completedAt: workflow.completedAt,
        transmittalId: workflow.transmittalId,
        transmittalNumber: workflow.transmittalNumber,
      },
    });

    return this.toDomain(updated);
  }

  private toDomain(row: {
    id: string;
    projectId: string;
    subject: string;
    documentIds: unknown;
    recipientIds: unknown;
    status: string;
    dueDate: string | null;
    remarks: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
    transmittalId: string | null;
    transmittalNumber: string | null;
  }): Workflow {
    return new Workflow(
      row.id,
      row.projectId,
      row.subject,
      this.toStringArray(row.documentIds),
      this.toStringArray(row.recipientIds),
      row.status as WorkflowStatus,
      row.dueDate,
      row.remarks,
      row.createdBy,
      row.createdAt,
      row.updatedAt,
      row.completedAt,
      row.transmittalId,
      row.transmittalNumber,
    );
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
  }
}
