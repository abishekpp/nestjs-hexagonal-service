export interface WorkflowOutput {
  id: string;
  projectId: string;
  subject: string;
  documentIds: string[];
  recipientIds: string[];
  status: string;
  dueDate?: string;
  remarks?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  transmittalId?: string;
  transmittalNumber?: string;
}
