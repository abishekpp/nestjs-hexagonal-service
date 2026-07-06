import { IsUUID } from 'class-validator';

export class GetTransmittalByIdGrpcRequestDto {
  @IsUUID()
  id!: string;
}
