export interface CreateWorkflowTransmittalInput {
  projectId: string;
  subject: string;
  documentIds: string[];
  recipientIds: string[];
  dueDate?: string;
  remarks?: string;
  createdBy: string;
}
