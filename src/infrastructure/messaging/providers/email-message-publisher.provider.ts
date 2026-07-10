import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaEmailMessagePublisherAdapter } from '../adapters/kafka/kafka-email-message-publisher.adapter';
import { NoopEmailMessagePublisherAdapter } from '../adapters/noop/noop-email-message-publisher.adapter';
import { EMAIL_KAFKA_CLIENT } from '../messaging.tokens';
import {
  EMAIL_MESSAGE_PUBLISHER_PORT,
  EmailMessagePublisherPort,
} from '../ports/email-message-publisher.port';

export const EmailMessagePublisherProvider: Provider = {
  provide: EMAIL_MESSAGE_PUBLISHER_PORT,
  useFactory: (
    configService: ConfigService,
    kafkaClient: ClientKafka,
  ): EmailMessagePublisherPort => {
    const broker = configService.get<string>('MESSAGE_BROKER', 'kafka');

    switch (broker) {
      case 'kafka':
        return new KafkaEmailMessagePublisherAdapter(kafkaClient, configService);

      case 'none':
        return new NoopEmailMessagePublisherAdapter();

      default:
        throw new Error(`Unsupported MESSAGE_BROKER: ${broker}`);
    }
  },
  inject: [ConfigService, EMAIL_KAFKA_CLIENT],
};
