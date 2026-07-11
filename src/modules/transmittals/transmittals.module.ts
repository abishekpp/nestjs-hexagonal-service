import { Module } from '@nestjs/common';
import { TransmittalsGrpcController } from './adapters/in/grpc/controllers/transmittals-grpc.controller';
import { PrismaModule } from '@infra/database/prisma/prisma.module';
import { CreateTransmittalUseCase } from './application/use-cases/create-transmittal.use-case';
import { GetTransmittalByIdUseCase } from './application/use-cases/get-transmittal-by-id.use-case';
import { TRANSMITTAL_REPOSITORY_PORT } from './ports/out/transmittal.repository.port';
import { PrismaTransmittalRepositoryAdapter } from './adapters/out/persistence/prisma-transmittal.repository.adapter';
import { CREATE_TRANSMITTAL_PORT } from './ports/in/create-transmittal.port';

@Module({
  imports: [PrismaModule],
  controllers: [TransmittalsGrpcController],
  providers: [
    CreateTransmittalUseCase,
    GetTransmittalByIdUseCase,
    {
      provide: TRANSMITTAL_REPOSITORY_PORT,
      useClass: PrismaTransmittalRepositoryAdapter,
    },
    {
      provide: CREATE_TRANSMITTAL_PORT,
      useExisting: CreateTransmittalUseCase,
    },
  ],
  exports: [CREATE_TRANSMITTAL_PORT],
})
export class TransmittalsModule {}
