import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { validateConfig } from '../validation/validate-config';

export class EnvConfig {
  @IsUrl(
    { require_protocol: true, require_tld: false },
    { message: 'VAULT_ADDR must be a valid URL' },
  )
  VAULT_ADDR!: string;

  @IsString()
  @IsNotEmpty({ message: 'VAULT_TOKEN is required' })
  VAULT_TOKEN!: string;
}

export function validateEnvConfig(config: Record<string, unknown>): EnvConfig {
  return validateConfig(EnvConfig, config);
}
