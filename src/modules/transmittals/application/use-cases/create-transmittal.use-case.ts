import { Inject, Injectable } from '@nestjs/common';
import { Transmittal } from '../../domain/entities/transmittal.entity';
import { TRANSMITTAL_REPOSITORY_PORT } from '../../ports/out/transmittal.repository.port';
import type { TransmittalRepositoryPort } from '../../ports/out/transmittal.repository.port';
import { CreateTransmittalInput } from '../dto/inputs/create-transmittal.input';
import { CreateTransmittalOutput } from '../dto/outputs/create-transmittal.output';

@Injectable()
export class CreateTransmittalUseCase {
  constructor(
    @Inject(TRANSMITTAL_REPOSITORY_PORT)
    private readonly transmittalRepository: TransmittalRepositoryPort,
  ) {}

  async execute(input: CreateTransmittalInput): Promise<CreateTransmittalOutput> {
    const transmittal = Transmittal.create(input);

    const created = await this.transmittalRepository.create(transmittal);

    return {
      id: created.id,
      transmittalNumber: created.transmittalNumber,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
    };
  }
}
