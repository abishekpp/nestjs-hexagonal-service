import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../infrastructure/database/prisma/prisma.service';
import { Transmittal, TransmittalStatus } from '../../../../domain/entities/transmittal.entity';
import { TransmittalRepositoryPort } from '../../../../ports/out/transmittal.repository.port';
import { BasePrismaRepository } from 'src/infrastructure/database/prisma/repositories/base-prisma.repository';
import { Transmittal as TransmittalPersistence } from 'generated/prisma/client';

@Injectable()
export class PrismaTransmittalRepositoryAdapter
  extends BasePrismaRepository<TransmittalPersistence>
  implements TransmittalRepositoryPort
{
  constructor(prisma: PrismaService) {
    super(prisma, 'transmittal');
  }

  async create(transmittal: Transmittal): Promise<Transmittal> {
    const created = await this.createRow({
      transmittalNumber: transmittal.transmittalNumber,
      projectId: transmittal.projectId,
      subject: transmittal.subject,
      documentIds: transmittal.documentIds,
      recipientIds: transmittal.recipientIds,
      status: transmittal.status,
      dueDate: transmittal.dueDate,
      remarks: transmittal.remarks,
      createdBy: transmittal.createdBy,
      createdAt: transmittal.createdAt,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Transmittal | null> {
    const row = await this.findByIdRow(id);

    return row ? this.toDomain(row) : null;
  }

  async existByProjectAndSubject(projectId: string, subject: string): Promise<boolean> {
    return this.existsRow({
      projectId,
      subject: {
        equals: subject.trim(),
        mode: 'insensitive',
      },
    });
  }

  private toDomain(row: {
    id: string;
    transmittalNumber: string;
    projectId: string;
    subject: string;
    documentIds: unknown;
    recipientIds: unknown;
    status: string;
    dueDate: string | null;
    remarks: string | null;
    createdBy: string;
    createdAt: Date;
  }): Transmittal {
    return new Transmittal(
      row.id,
      row.transmittalNumber,
      row.projectId,
      row.subject,
      this.toStringArray(row.documentIds),
      this.toStringArray(row.recipientIds),
      row.status as TransmittalStatus,
      row.dueDate,
      row.remarks,
      row.createdBy,
      row.createdAt,
    );
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
  }
}
