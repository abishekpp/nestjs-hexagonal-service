import { Inject, Injectable } from '@nestjs/common';
import {
  CREATE_TRANSMITTAL_PORT,
  type CreateTransmittalPort,
} from 'src/modules/transmittals/ports/in/create-transmittal.port';
import { CreateWorkflowTransmittalInput } from '../../../application/dto/inputs/create-workflow-transmittal.input';
import { WorkflowTransmittalOutput } from '../../../application/dto/outputs/workflow-transmittal.output';
import { WorkflowTransmittalPort } from '../../../ports/out/workflow-transmittal.port';

@Injectable()
export class TransmittalModuleAdapter implements WorkflowTransmittalPort {
  constructor(
    @Inject(CREATE_TRANSMITTAL_PORT)
    private readonly createTransmittalPort: CreateTransmittalPort,
  ) {}

  async createTransmittal(
    input: CreateWorkflowTransmittalInput,
  ): Promise<WorkflowTransmittalOutput> {
    return this.createTransmittalPort.execute({
      projectId: input.projectId,
      subject: input.subject,
      documentIds: input.documentIds,
      recipientIds: input.recipientIds,
      dueDate: input.dueDate,
      remarks: input.remarks,
      createdBy: input.createdBy,
    });
  }
}
