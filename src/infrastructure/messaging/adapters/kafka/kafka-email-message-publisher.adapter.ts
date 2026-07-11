import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  EmailMessagePublisherPort,
  KafkaEmailBody,
} from '@infra/messaging/ports/email-message-publisher.port';
import { EMAIL_KAFKA_CLIENT } from '@infra/messaging/messaging.tokens';

@Injectable()
export class KafkaEmailMessagePublisherAdapter
  implements EmailMessagePublisherPort, OnApplicationShutdown
{
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

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Application is shutting down due to signal: ${signal}`);
    await this.kafkaClient.close();
    this.logger.log('Kafka client disconnected.');
  }
}
