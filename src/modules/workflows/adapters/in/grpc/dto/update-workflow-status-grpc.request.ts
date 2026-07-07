import { IsIn, IsUUID } from 'class-validator';

export class UpdateWorkflowStatusGrpcRequestDto {
  @IsUUID()
  id!: string;

  @IsIn(['COMPLETED'])
  status!: 'COMPLETED';
}
