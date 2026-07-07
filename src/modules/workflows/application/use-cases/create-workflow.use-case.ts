import { Inject, Injectable } from '@nestjs/common';
import { ApplicationException } from 'src/common/exceptions/application.exception';
import { ExceptionType } from 'src/shared/enums/exception-type.enum';
import { Workflow } from '../../domain/entities/workflow.entity';
import {
  WORKFLOW_REPOSITORY_PORT,
  type WorkflowRepositoryPort,
} from '../../ports/out/workflow.repository.port';
import { CreateWorkflowInput } from '../dto/inputs/create-workflow.input';
import { WorkflowOutput } from '../dto/outputs/workflow.output';
import { toWorkflowOutput } from './workflow-output.mapper';

@Injectable()
export class CreateWorkflowUseCase {
  constructor(
    @Inject(WORKFLOW_REPOSITORY_PORT)
    private readonly workflowRepository: WorkflowRepositoryPort,
  ) {}

  async execute(input: CreateWorkflowInput): Promise<WorkflowOutput> {
    this.validateBusinessRules(input);

    const workflow = Workflow.create(input);
    const created = await this.workflowRepository.create(workflow);

    return toWorkflowOutput(created);
  }

  private validateBusinessRules(input: CreateWorkflowInput): void {
    const duplicateDocumentIds = this.findDuplicates(input.documentIds);

    if (duplicateDocumentIds.length > 0) {
      throw new ApplicationException(
        `Duplicate document ids are not allowed: ${duplicateDocumentIds.join(', ')}`,
        'WORKFLOW_DUPLICATE_DOCUMENT_IDS',
        ExceptionType.VALIDATION,
      );
    }

    const duplicateRecipientIds = this.findDuplicates(input.recipientIds);

    if (duplicateRecipientIds.length > 0) {
      throw new ApplicationException(
        `Duplicate recipient ids are not allowed: ${duplicateRecipientIds.join(', ')}`,
        'WORKFLOW_DUPLICATE_RECIPIENT_IDS',
        ExceptionType.VALIDATION,
      );
    }

    if (input.documentIds.length > 50) {
      throw new ApplicationException(
        'A workflow cannot contain more than 50 documents',
        'WORKFLOW_DOCUMENT_LIMIT_EXCEEDED',
        ExceptionType.VALIDATION,
      );
    }

    if (input.recipientIds.length > 100) {
      throw new ApplicationException(
        'A workflow cannot contain more than 100 recipients',
        'WORKFLOW_RECIPIENT_LIMIT_EXCEEDED',
        ExceptionType.VALIDATION,
      );
    }

    if (input.dueDate && this.isPastDate(input.dueDate)) {
      throw new ApplicationException(
        'Due date cannot be in the past',
        'WORKFLOW_DUE_DATE_CANNOT_BE_PAST',
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
}
