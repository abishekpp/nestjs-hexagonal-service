import { Logger } from '@nestjs/common';
import { type VaultConfig, validateVaultConfig } from './vault.schema';
import { VaultSecretResponse } from './vault.types';

export class VaultService {
  private readonly logger = new Logger(VaultService.name);
  private secrets: VaultConfig | null = null;

  async sync(): Promise<void> {
    const addr = process.env.VAULT_ADDR;
    const token = process.env.VAULT_TOKEN;

    if (!addr || !token) {
      throw new Error('VAULT_ADDR and VAULT_TOKEN must be set in .env');
    }

    try {
      const response = await fetch(addr, {
        headers: { 'X-Vault-Token': token },
      });

      if (!response.ok) {
        throw new Error(`Vault responded with status ${response.status}`);
      }

      const json = (await response.json()) as VaultSecretResponse;

      // Validate — throws with clear field-level errors if invalid
      const parsed = validateVaultConfig(json.data.data);
      this.secrets = parsed;

      // Hydrate process.env for framework compatibility
      for (const [key, value] of Object.entries(parsed)) {
        process.env[key] = value;
      }

      this.logger.log(`Vault secrets loaded — ${Object.keys(parsed).length} keys validated`);
    } catch (error) {
      this.logger.error('Vault sync failed — aborting bootstrap', error);
      throw error;
    }
  }

  get<K extends keyof VaultConfig>(key: K): VaultConfig[K] {
    if (!this.secrets) {
      throw new Error('VaultService.sync() has not been called yet');
    }
    return this.secrets[key];
  }

  getAll(): VaultConfig {
    if (!this.secrets) {
      throw new Error('VaultService.sync() has not been called yet');
    }
    return this.secrets;
  }
}
