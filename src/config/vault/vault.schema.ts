import { IsIn, IsNotEmpty, IsString, Matches } from 'class-validator';
import { validateConfig } from '../validation/validate-config';

export type NodeEnv = 'development' | 'production' | 'test';

export class VaultConfig {
  @IsString()
  @Matches(/^\d+$/, { message: 'PORT must be numeric' })
  PORT!: string;

  @IsIn(['development', 'production', 'test'], {
    message: 'NODE_ENV must be one of: development, production, test',
  })
  NODE_ENV: NodeEnv = 'development';

  @IsString()
  REQUEST_BODY_LIMIT = '10mb';

  @IsString()
  CORS_ORIGINS = '';

  @IsString()
  @IsNotEmpty({ message: 'DATABASE_URL is required' })
  DATABASE_URL!: string;

  @IsString()
  @Matches(/^\d+$/, { message: 'GRPC_PORT must be numeric' })
  GRPC_PORT = '50052';

  @IsIn(['kafka', 'none'], {
    message: 'MESSAGE_BROKER must be one of: kafka, none',
  })
  MESSAGE_BROKER: 'kafka' | 'none' = 'kafka';

  @IsString()
  KAFKA_CLIENT_ID = 'core-service';

  @IsString()
  KAFKA_BROKERS = 'localhost:9092';

  @IsString()
  EMAIL_KAFKA_TOPIC = 'email.send';

  @IsString()
  EMAIL_SENDER_EMAIL = '';

  @IsString()
  EMAIL_SENDER_PASSWORD = '';
}

export function validateVaultConfig(config: Record<string, unknown>): VaultConfig {
  return validateConfig(VaultConfig, config);
}
