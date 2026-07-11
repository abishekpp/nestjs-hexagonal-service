import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import {
  Transmittal as TransmittalDomainEntitiy,
  TransmittalStatus,
} from '@modules/transmittals/domain/entities/transmittal.entity';
import { TransmittalRepositoryPort } from '@modules/transmittals/ports/out/transmittal.repository.port';
import { BasePrismaRepository } from '@infra/database/prisma/repositories/base-prisma.repository';
import { Transmittal as TransmittalPersistence } from 'generated/prisma/client';

@Injectable()
export class PrismaTransmittalRepositoryAdapter
  extends BasePrismaRepository<TransmittalDomainEntitiy, TransmittalPersistence>
  implements TransmittalRepositoryPort
{
  constructor(prisma: PrismaService) {
    super(prisma, 'transmittal');
  }

  async existByProjectAndSubject(projectId: string, subject: string): Promise<boolean> {
    return this.existsByWhere({
      projectId,
      subject: {
        equals: subject.trim(),
        mode: 'insensitive',
      },
    });
  }

  protected toPersistence(entity: Partial<TransmittalDomainEntitiy>): Record<string, unknown> {
    return {
      ...(entity.id ? { id: entity.id } : {}),
      ...(entity.transmittalNumber ? { transmittalNumber: entity.transmittalNumber } : {}),
      ...(entity.projectId ? { projectId: entity.projectId } : {}),
      ...(entity.subject ? { subject: entity.subject } : {}),
      ...(entity.documentIds ? { documentIds: entity.documentIds } : {}),
      ...(entity.recipientIds ? { recipientIds: entity.recipientIds } : {}),
      ...(entity.status ? { status: entity.status } : {}),
      ...(entity.dueDate !== undefined ? { dueDate: entity.dueDate } : {}),
      ...(entity.remarks !== undefined ? { remarks: entity.remarks } : {}),
      ...(entity.createdBy ? { createdBy: entity.createdBy } : {}),
      ...(entity.createdAt ? { createdAt: entity.createdAt } : {}),
    };
  }

  protected toDomain(row: TransmittalPersistence): TransmittalDomainEntitiy {
    return new TransmittalDomainEntitiy(
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
