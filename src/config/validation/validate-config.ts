import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';

type ClassConstructor<T> = {
  new (): T;
};

export class ConfigValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string[]>) {
    super('Configuration validation failed');
  }
}

export function validateConfig<T extends object>(
  configClass: ClassConstructor<T>,
  config: Record<string, unknown>,
): T {
  const validatedConfig = plainToInstance(configClass, config);
  const errors = validateSync(validatedConfig, {
    forbidUnknownValues: false,
    skipMissingProperties: false,
    whitelist: true,
  });

  if (errors.length > 0) {
    throw new ConfigValidationError(formatValidationErrors(errors));
  }

  return validatedConfig;
}

function formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
  return errors.reduce<Record<string, string[]>>((fieldErrors, error) => {
    fieldErrors[error.property] = Object.values(error.constraints ?? {});
    return fieldErrors;
  }, {});
}
