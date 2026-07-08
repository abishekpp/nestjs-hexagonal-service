import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaEmailMessagePublisherAdapter } from './adapters/kafka/kafka-email-message-publisher.adapter';
import { NoopEmailMessagePublisherAdapter } from './adapters/noop/noop-email-message-publisher.adapter';
import { EMAIL_KAFKA_CLIENT } from './messaging.tokens';
import { EmailMessagePublisherProvider } from './providers/email-message-publisher.provider';
import { EMAIL_MESSAGE_PUBLISHER_PORT } from './ports/email-message-publisher.port';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: EMAIL_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: process.env.KAFKA_CLIENT_ID ?? 'core-service',
            brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  providers: [
    KafkaEmailMessagePublisherAdapter,
    NoopEmailMessagePublisherAdapter,
    EmailMessagePublisherProvider,
  ],
  exports: [EMAIL_MESSAGE_PUBLISHER_PORT],
})
export class MessagingModule {}
