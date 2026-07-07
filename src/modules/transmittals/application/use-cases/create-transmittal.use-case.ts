import { Inject, Injectable } from '@nestjs/common';
import { Transmittal } from '../../domain/entities/transmittal.entity';
import { TRANSMITTAL_REPOSITORY_PORT } from '../../ports/out/transmittal.repository.port';
import type { TransmittalRepositoryPort } from '../../ports/out/transmittal.repository.port';
import { CreateTransmittalInput } from '../dto/inputs/create-transmittal.input';
import { CreateTransmittalOutput } from '../dto/outputs/create-transmittal.output';
import { ApplicationException } from 'src/common/exceptions/application.exception';
import { ExceptionType } from 'src/shared/enums/exception-type.enum';

@Injectable()
export class CreateTransmittalUseCase {
  constructor(
    @Inject(TRANSMITTAL_REPOSITORY_PORT)
    private readonly transmittalRepository: TransmittalRepositoryPort,
  ) {}

  async execute(input: CreateTransmittalInput): Promise<CreateTransmittalOutput> {
    // Validate business rules
    this.validateBusinessRules(input);

    await this.ensureUniqueTransmittal(input);

    const transmittal = Transmittal.create(input);

    const created = await this.transmittalRepository.create(transmittal);

    return {
      id: created.id,
      transmittalNumber: created.transmittalNumber,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
    };
  }

  private validateBusinessRules(input: CreateTransmittalInput): void {
    const duplicateDocumentIds = this.findDuplicates(input.documentIds);

    if (duplicateDocumentIds.length > 0) {
      throw new ApplicationException(
        `Duplicate document ids are not allowed: ${duplicateDocumentIds.join(', ')}`,
        'DUPLICATE_DOCUMENT_IDS',
        ExceptionType.VALIDATION,
      );
    }

    const duplicateRecipientIds = this.findDuplicates(input.recipientIds);

    if (duplicateRecipientIds.length > 0) {
      throw new ApplicationException(
        `Duplicate recipient ids are not allowed: ${duplicateRecipientIds.join(', ')}`,
        'DUPLICATE_RECIPIENT_IDS',
        ExceptionType.VALIDATION,
      );
    }

    if (input.documentIds.length > 50) {
      throw new ApplicationException(
        'A transmittal cannot contain more than 50 documents',
        'TRANSMITTAL_DOCUMENT_LIMIT_EXCEEDED',
        ExceptionType.VALIDATION,
      );
    }

    if (input.recipientIds.length > 100) {
      throw new ApplicationException(
        'A transmittal cannot contain more than 100 recipients',
        'TRANSMITTAL_RECIPIENT_LIMIT_EXCEEDED',
        ExceptionType.VALIDATION,
      );
    }

    if (input.dueDate && this.isPastDate(input.dueDate)) {
      throw new ApplicationException(
        'Due date cannot be in the past',
        'DUE_DATE_CANNOT_BE_PAST',
        ExceptionType.VALIDATION,
      );
    }
  }

  private findDuplicates(values: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const value of values) {
      if (seen.has(value)) {
        duplicates.add(value);
      }

      seen.add(value);
    }

    return Array.from(duplicates);
  }

  private isPastDate(dateString: string): boolean {
    const inputDate = new Date(dateString);
    const today = new Date();

    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return inputDate < today;
  }

  private async ensureUniqueTransmittal(input: CreateTransmittalInput): Promise<void> {
    const exists = await this.transmittalRepository.existByProjectAndSubject(
      input.projectId,
      input.subject,
    );

    if (exists) {
      throw new ApplicationException(
        `A transmittal with the subject "${input.subject}" already exists for project "${input.projectId}"`,
        'DUPLICATE_TRANSMITTAL_SUBJECT',
        ExceptionType.CONFLICT,
      );
    }
  }
}
