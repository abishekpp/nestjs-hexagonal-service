import { BaseRepositoryPort } from 'src/common/ports/base-repository.port';
import { Transmittal as TransmittalDomainEntitiy } from '../../domain/entities/transmittal.entity';

export const TRANSMITTAL_REPOSITORY_PORT = Symbol('TRANSMITTAL_REPOSITORY_PORT');

export interface TransmittalRepositoryPort extends BaseRepositoryPort<TransmittalDomainEntitiy> {
  // If you have additonal and this module specific port add here.

  existByProjectAndSubject(projectId: string, subject: string): Promise<boolean>;
}
