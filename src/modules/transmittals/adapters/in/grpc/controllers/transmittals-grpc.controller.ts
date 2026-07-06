import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateTransmittalUseCase } from '../../../../application/use-cases/create-transmittal.use-case';
import { GetTransmittalByIdUseCase } from '../../../../application/use-cases/get-transmittal-by-id.use-case';

@Controller()
export class TransmittalsGrpcController {
  constructor(
    private readonly createTransmittalUseCase: CreateTransmittalUseCase,
    private readonly getTransmittalByIdUseCase: GetTransmittalByIdUseCase,
  ) {}

  @GrpcMethod('TransmittalService', 'CreateTransmittal')
  async createTransmittal(data: {
    projectId: string;
    subject: string;
    documentIds: string[];
    recipientIds: string[];
    dueDate?: string;
    remarks?: string;
    createdBy: string;
  }) {
    return this.createTransmittalUseCase.execute({
      projectId: data.projectId,
      subject: data.subject,
      documentIds: data.documentIds ?? [],
      recipientIds: data.recipientIds ?? [],
      dueDate: data.dueDate,
      remarks: data.remarks,
      createdBy: data.createdBy,
    });
  }

  @GrpcMethod('TransmittalService', 'GetTransmittalById')
  async getTransmittalById(data: { id: string }) {
    const transmittal = await this.getTransmittalByIdUseCase.execute(data.id);

    if (!transmittal) {
      return {
        id: '',
        transmittalNumber: '',
        projectId: '',
        subject: '',
        documentIds: [],
        recipientIds: [],
        status: '',
        dueDate: '',
        remarks: '',
        createdBy: '',
        createdAt: '',
      };
    }

    return transmittal;
  }
}
