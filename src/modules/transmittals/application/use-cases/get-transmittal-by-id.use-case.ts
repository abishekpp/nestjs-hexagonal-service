import { Inject, Injectable } from '@nestjs/common';
import { TRANSMITTAL_REPOSITORY_PORT } from '@modules/transmittals/ports/out/transmittal.repository.port';
import type { TransmittalRepositoryPort } from '@modules/transmittals/ports/out/transmittal.repository.port';
import { TransmittalOutput } from '../dto/outputs/transmittal.output';

@Injectable()
export class GetTransmittalByIdUseCase {
  constructor(
    @Inject(TRANSMITTAL_REPOSITORY_PORT)
    private readonly transmittalRepository: TransmittalRepositoryPort,
  ) {}

  async execute(id: string): Promise<TransmittalOutput | null> {
    const transmittal = await this.transmittalRepository.findById(id);

    if (!transmittal) {
      return null;
    }

    return {
      id: transmittal.id,
      transmittalNumber: transmittal.transmittalNumber,
      projectId: transmittal.projectId,
      subject: transmittal.subject,
      documentIds: transmittal.documentIds,
      recipientIds: transmittal.recipientIds,
      status: transmittal.status,
      dueDate: transmittal.dueDate,
      remarks: transmittal.remarks,
      createdBy: transmittal.createdBy,
      createdAt: transmittal.createdAt.toISOString(),
    };
  }
}
