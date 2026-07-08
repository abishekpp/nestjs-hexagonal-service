import { Injectable, Logger } from '@nestjs/common';
import {
  EmailMessagePublisherPort,
  KafkaEmailBody,
} from '../../ports/email-message-publisher.port';

@Injectable()
export class NoopEmailMessagePublisherAdapter implements EmailMessagePublisherPort {
  private readonly logger = new Logger(NoopEmailMessagePublisherAdapter.name);

  async publishEmail(input: KafkaEmailBody): Promise<void> {
    this.logger.warn(`Email publisher disabled. Skipped email to ${input.receiverEmail}`);
  }
}
