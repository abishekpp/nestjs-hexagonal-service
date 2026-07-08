export const EMAIL_MESSAGE_PUBLISHER_PORT = Symbol('EMAIL_MESSAGE_PUBLISHER_PORT');

export type KafkaEmailBody = {
  senderEmail?: string;
  senderPassword?: string;
  receiverEmail: string;
  subject: string;
  body: string;
  attachments?: boolean;
  data?: {
    fileName: string;
    content: string;
    contentType: string;
  };
};

export interface EmailMessagePublisherPort {
  publishEmail(input: KafkaEmailBody): Promise<void>;
}
