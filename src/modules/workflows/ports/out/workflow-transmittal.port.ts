import { CreateWorkflowTransmittalInput } from '@modules/workflows/application/dto/inputs/create-workflow-transmittal.input';
import { WorkflowTransmittalOutput } from '@modules/workflows/application/dto/outputs/workflow-transmittal.output';

export const WORKFLOW_TRANSMITTAL_PORT = Symbol('WORKFLOW_TRANSMITTAL_PORT');

export interface WorkflowTransmittalPort {
  createTransmittal(input: CreateWorkflowTransmittalInput): Promise<WorkflowTransmittalOutput>;
}
