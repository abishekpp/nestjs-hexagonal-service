import { Transmittal } from '../../domain/entities/transmittal.entity';

export const TRANSMITTAL_REPOSITORY_PORT = Symbol('TRANSMITTAL_REPOSITORY_PORT');

export interface TransmittalRepositoryPort {
  create(transmittal: Transmittal): Promise<Transmittal>;
  findById(id: string): Promise<Transmittal | null>;
  existByProjectAndSubject(projectId: string, subject: string): Promise<boolean>;
}
