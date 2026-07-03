import { IsIn, IsString, Matches } from 'class-validator';
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
}

export function validateVaultConfig(config: Record<string, unknown>): VaultConfig {
  return validateConfig(VaultConfig, config);
}
