import { plainToInstance } from 'class-transformer';
import {
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsString()
  MONGODB_URI: string;

  @IsString()
  JWT_SELLER_SECRET: string;

  @IsString()
  JWT_CUSTOMER_SECRET: string;

  /**
   * Required only in prod — loaded from Parameter Store via EnvProviderModule.
   * In non-prod environments NodeFS is used and S3 is not initialised,
   * so these variables are not needed in process.env.
   */
  @IsOptional()
  @IsString()
  AWS_REGION?: string;

  @IsOptional()
  @IsString()
  AWS_ACCESS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  AWS_SECRET_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  S3_BUCKET_NAME?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) throw new Error(errors.toString());
  return validated;
}
