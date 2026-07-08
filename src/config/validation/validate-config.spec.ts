import { ConfigValidationError } from './validate-config';
import { validateEnvConfig } from '../env/env.schema';
import { validateVaultConfig } from '../vault/vault.schema';

describe('config validation', () => {
  it('validates required environment values', () => {
    const config = validateEnvConfig({
      VAULT_ADDR: 'http://localhost:8200/v1/secret/data/app',
      VAULT_TOKEN: 'root',
    });

    expect(config.VAULT_ADDR).toBe('http://localhost:8200/v1/secret/data/app');
    expect(config.VAULT_TOKEN).toBe('root');
  });

  it('throws field-level errors for invalid environment values', () => {
    let caughtError: unknown;

    try {
      validateEnvConfig({
        VAULT_ADDR: 'not-a-url',
        VAULT_TOKEN: '',
      });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(ConfigValidationError);
    expect((caughtError as ConfigValidationError).fieldErrors).toHaveProperty('VAULT_ADDR');
    expect((caughtError as ConfigValidationError).fieldErrors).toHaveProperty('VAULT_TOKEN');
  });

  it('applies vault config defaults', () => {
    const config = validateVaultConfig({
      PORT: '3000',
      DATABASE_URL: 'postgresql://user:password@localhost:5432/app',
    });

    expect(config.PORT).toBe('3000');
    expect(config.NODE_ENV).toBe('development');
    expect(config.REQUEST_BODY_LIMIT).toBe('10mb');
    expect(config.CORS_ORIGINS).toBe('');
    expect(config.GRPC_PORT).toBe('50052');
    expect(config.MESSAGE_BROKER).toBe('kafka');
    expect(config.KAFKA_CLIENT_ID).toBe('core-service');
    expect(config.KAFKA_BROKERS).toBe('localhost:9092');
    expect(config.EMAIL_KAFKA_TOPIC).toBe('email.send');
  });

  it('throws field-level errors for invalid vault values', () => {
    let caughtError: unknown;

    try {
      validateVaultConfig({
        PORT: 'abc',
        NODE_ENV: 'local',
        DATABASE_URL: '',
        GRPC_PORT: 'grpc',
        MESSAGE_BROKER: 'rabbitmq',
      });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(ConfigValidationError);
    expect((caughtError as ConfigValidationError).fieldErrors).toHaveProperty('PORT');
    expect((caughtError as ConfigValidationError).fieldErrors).toHaveProperty('NODE_ENV');
    expect((caughtError as ConfigValidationError).fieldErrors).toHaveProperty('DATABASE_URL');
    expect((caughtError as ConfigValidationError).fieldErrors).toHaveProperty('GRPC_PORT');
    expect((caughtError as ConfigValidationError).fieldErrors).toHaveProperty('MESSAGE_BROKER');
  });
});
