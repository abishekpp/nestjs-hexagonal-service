export interface CreateTransmittalInput {
  projectId: string;
  subject: string;
  documentIds: string[];
  recipientIds: string[];
  dueDate?: string;
  remarks?: string;
  createdBy: string;
}
