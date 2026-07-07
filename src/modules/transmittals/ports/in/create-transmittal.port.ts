import { CreateTransmittalInput } from '../../application/dto/inputs/create-transmittal.input';
import { CreateTransmittalOutput } from '../../application/dto/outputs/create-transmittal.output';

export const CREATE_TRANSMITTAL_PORT = Symbol('CREATE_TRANSMITTAL_PORT');

export interface CreateTransmittalPort {
  execute(input: CreateTransmittalInput): Promise<CreateTransmittalOutput>;
}
