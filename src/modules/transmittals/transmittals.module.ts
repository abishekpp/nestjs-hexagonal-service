import { Module } from '@nestjs/common';
import { TransmittalsGrpcController } from './adapters/in/grpc/controllers/transmittals-grpc.controller';
import { PrismaModule } from 'src/infrastructure/database/prisma/prisma.module';
import { CreateTransmittalUseCase } from './application/use-cases/create-transmittal.use-case';
import { GetTransmittalByIdUseCase } from './application/use-cases/get-transmittal-by-id.use-case';
import { TRANSMITTAL_REPOSITORY_PORT } from './ports/out/transmittal.repository.port';
import { PrismaTransmittalRepositoryAdapter } from './adapters/out/persistence/prisma/prisma-transmittal.repository.adapter';

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
  ],
})
export class TransmittalsModule {}
