export interface CreateWorkflowInput {
  projectId: string;
  subject: string;
  documentIds: string[];
  recipientIds: string[];
  dueDate?: string;
  remarks?: string;
  createdBy: string;
}
