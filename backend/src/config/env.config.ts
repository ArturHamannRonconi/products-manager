import { plainToInstance } from 'class-transformer';
import {
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsString()
  S3_BUCKET_NAME: string;
  
  @IsString()
  FRONTEND_URL: string;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  JWT_SELLER_SECRET: string;

  @IsString()
  JWT_CUSTOMER_SECRET: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) throw new Error(errors.toString());
  return validated;
}
