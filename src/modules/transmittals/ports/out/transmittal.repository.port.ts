import { BaseRepositoryPort } from 'src/common/ports/base-repository.port';
import { Transmittal } from '../../domain/entities/transmittal.entity';

export const TRANSMITTAL_REPOSITORY_PORT = Symbol('TRANSMITTAL_REPOSITORY_PORT');

export interface TransmittalRepositoryPort extends BaseRepositoryPort<Transmittal> {
  existByProjectAndSubject(projectId: string, subject: string): Promise<boolean>;
}
