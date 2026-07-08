// src/infrastructure/messaging/adapters/kafka/kafka-email-message-publisher.adapter.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  EmailMessagePublisherPort,
  KafkaEmailBody,
} from '../../ports/email-message-publisher.port';
import { EMAIL_KAFKA_CLIENT } from '../../messaging.tokens';

@Injectable()
export class KafkaEmailMessagePublisherAdapter implements EmailMessagePublisherPort {
  private readonly logger = new Logger(KafkaEmailMessagePublisherAdapter.name);

  constructor(
    @Inject(EMAIL_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async publishEmail(input: KafkaEmailBody): Promise<void> {
    const topic = process.env.EMAIL_KAFKA_TOPIC ?? 'email.send';

    await firstValueFrom(this.kafkaClient.emit(topic, input));

    this.logger.log(`Published email event to ${input.receiverEmail}`);
  }
}
