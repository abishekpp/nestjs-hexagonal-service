import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
    this.logger.log('Kafka client connected.');
  }

  async publishEmail(input: KafkaEmailBody): Promise<void> {
    const topic = this.configService.get<string>('EMAIL_KAFKA_TOPIC', 'email.send');
    const payload: KafkaEmailBody = {
      ...input,
      senderEmail: input.senderEmail ?? this.configService.get<string>('EMAIL_SENDER_EMAIL', ''),
      senderPassword:
        input.senderPassword ?? this.configService.get<string>('EMAIL_SENDER_PASSWORD', ''),
    };

    await firstValueFrom(this.kafkaClient.emit(topic, payload));

    this.logger.log(`Published email event to ${input.receiverEmail}`);
  }
}
