import { CreateWorkflowTransmittalInput } from '../../application/dto/inputs/create-workflow-transmittal.input';
import { WorkflowTransmittalOutput } from '../../application/dto/outputs/workflow-transmittal.output';

export const WORKFLOW_TRANSMITTAL_PORT = Symbol('WORKFLOW_TRANSMITTAL_PORT');

export interface WorkflowTransmittalPort {
  createTransmittal(input: CreateWorkflowTransmittalInput): Promise<WorkflowTransmittalOutput>;
}
