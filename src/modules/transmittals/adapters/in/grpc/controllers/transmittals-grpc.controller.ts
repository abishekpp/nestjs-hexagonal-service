import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { CreateTransmittalUseCase } from '../../../../application/use-cases/create-transmittal.use-case';
import { GetTransmittalByIdUseCase } from '../../../../application/use-cases/get-transmittal-by-id.use-case';
import { CreateTransmittalGrpcRequestDto } from '../dto/create-transmittal-grpc.request';
import { GetTransmittalByIdGrpcRequestDto } from '../dto/get-transmittal-by-id-grpc.request';

@Controller()
export class TransmittalsGrpcController {
  constructor(
    private readonly createTransmittalUseCase: CreateTransmittalUseCase,
    private readonly getTransmittalByIdUseCase: GetTransmittalByIdUseCase,
  ) {}

  @GrpcMethod('TransmittalService', 'CreateTransmittal')
  async createTransmittal(@Payload() data: CreateTransmittalGrpcRequestDto) {
    return this.createTransmittalUseCase.execute({
      projectId: data.projectId,
      subject: data.subject,
      documentIds: data.documentIds ?? [],
      recipientIds: data.recipientIds ?? [],
      dueDate: data.dueDate || undefined,
      remarks: data.remarks || undefined,
      createdBy: data.createdBy,
    });
  }

  @GrpcMethod('TransmittalService', 'GetTransmittalById')
  async getTransmittalById(@Payload() data: GetTransmittalByIdGrpcRequestDto) {
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
