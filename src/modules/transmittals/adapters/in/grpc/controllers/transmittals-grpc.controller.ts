import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class TransmittalsGrpcController {
  @GrpcMethod('TransmittalService', 'CreateTransmittal')
  createTransmittal(data: {
    projectId: string;
    subject: string;
    documentIds: string[];
    recipientIds: string[];
    dueDate?: string;
    remarks?: string;
    createdBy: string;
  }) {
    return {
      id: 'trn-uuid-001',
      transmittalNumber: 'TRN-2026-0001',
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    };
  }

  @GrpcMethod('TransmittalService', 'GetTransmittalById')
  getTransmittalById(data: { id: string }) {
    return {
      id: data.id,
      transmittalNumber: 'TRN-2026-0001',
      projectId: 'project-uuid',
      subject: 'Issued for review - HVAC shop drawings',
      documentIds: ['doc-1', 'doc-2'],
      recipientIds: ['user-1', 'user-2'],
      status: 'DRAFT',
      dueDate: '2026-07-15',
      remarks: 'Please review and respond within 7 days.',
      createdBy: 'current-user-id',
      createdAt: new Date().toISOString(),
    };
  }
}
