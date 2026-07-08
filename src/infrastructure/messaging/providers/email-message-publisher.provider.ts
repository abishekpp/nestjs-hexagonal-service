import { Provider } from '@nestjs/common';
import { KafkaEmailMessagePublisherAdapter } from '../adapters/kafka/kafka-email-message-publisher.adapter';
import { NoopEmailMessagePublisherAdapter } from '../adapters/noop/noop-email-message-publisher.adapter';
import {
  EMAIL_MESSAGE_PUBLISHER_PORT,
  EmailMessagePublisherPort,
} from '../ports/email-message-publisher.port';

export const EmailMessagePublisherProvider: Provider = {
  provide: EMAIL_MESSAGE_PUBLISHER_PORT,
  useFactory: (
    kafkaAdapter: KafkaEmailMessagePublisherAdapter,
    noopAdapter: NoopEmailMessagePublisherAdapter,
  ): EmailMessagePublisherPort => {
    const broker = process.env.MESSAGE_BROKER ?? 'kafka';

    switch (broker) {
      case 'kafka':
        return kafkaAdapter;

      case 'none':
        return noopAdapter;

      default:
        throw new Error(`Unsupported MESSAGE_BROKER: ${broker}`);
    }
  },
  inject: [KafkaEmailMessagePublisherAdapter, NoopEmailMessagePublisherAdapter],
};
