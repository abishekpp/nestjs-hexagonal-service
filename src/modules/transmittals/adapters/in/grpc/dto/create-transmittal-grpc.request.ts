import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTransmittalGrpcRequestDto {
  @IsString()
  projectId!: string;

  @IsString()
  @MaxLength(255)
  subject!: string;

  @IsArray()
  @IsString({ each: true })
  documentIds!: string[];

  @IsArray()
  @IsString({ each: true })
  recipientIds!: string[];

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  dueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => (value === '' ? undefined : value))
  remarks?: string;

  @IsString()
  createdBy!: string;
}
