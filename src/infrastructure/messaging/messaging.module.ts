import { Global, Module } from '@nestjs/common';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';
import { KafkaEmailMessagePublisherAdapter } from './adapters/kafka/kafka-email-message-publisher.adapter';
import { NoopEmailMessagePublisherAdapter } from './adapters/noop/noop-email-message-publisher.adapter';
import { EMAIL_KAFKA_CLIENT } from './messaging.tokens';
import { EmailMessagePublisherProvider } from './providers/email-message-publisher.provider';
import { EMAIL_MESSAGE_PUBLISHER_PORT } from './ports/email-message-publisher.port';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getKafkaClientConfig } from 'src/config/kafka/kafka.config';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: EMAIL_KAFKA_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService): ClientProviderOptions =>
          getKafkaClientConfig(EMAIL_KAFKA_CLIENT, configService),
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
