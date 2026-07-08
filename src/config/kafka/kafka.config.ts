import { ConfigService } from '@nestjs/config';
import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { KafkaOptions } from '@nestjs/microservices/interfaces';

export const getKafkaClientConfig = (
  name: string,
  configService: ConfigService,
): ClientProviderOptions => {
  const rawBrokers = configService.get<string>('KAFKA_BROKERS', '');
  const clientId = configService.get<string>('KAFKA_CLIENT_ID', 'core-service');
  const brokers = rawBrokers.split(',').map((b) => b.trim());
  return {
    name,
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId,
        brokers,
      },
      producerOnlyMode: true,
    },
  } as KafkaOptions & { name: string };
};
