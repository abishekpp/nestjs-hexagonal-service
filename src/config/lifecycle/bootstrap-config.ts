import { Logger } from '@nestjs/common';
import { VaultService } from '../vault/vault.service';
import { validateEnvConfig } from '../env/env.schema';
import { ConfigValidationError } from '../validation/validate-config';

const logger = new Logger('Bootstrap');

export const vaultService = new VaultService();

export async function bootstrapConfig(): Promise<void> {
  // 1. Validate .env first
  try {
    validateEnvConfig(process.env);
  } catch (error) {
    logger.error('Invalid .env configuration');
    if (error instanceof ConfigValidationError) {
      logger.error(error.fieldErrors);
    }
    throw new Error('Environment validation failed');
  }

  logger.log('.env validated successfully');

  // 2. Load + validate Vault secrets
  await vaultService.sync();
}
