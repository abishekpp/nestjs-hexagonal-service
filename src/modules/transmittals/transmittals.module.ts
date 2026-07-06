import { Module } from '@nestjs/common';
import { TransmittalsGrpcController } from './adapters/in/grpc/controllers/transmittals-grpc.controller';

@Module({
  imports: [],
  controllers: [TransmittalsGrpcController],
  providers: [],
})
export class TransmittalsModule {}
