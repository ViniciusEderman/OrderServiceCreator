import dotenv from 'dotenv';
import path from 'path';
import { EnvException } from '@/shared/exceptions/env-exception';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function requiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) { throw new EnvException(key) };
  return value;
}

export const env = {
  PORT: requiredEnv('PORT'),
  DATABASE_URL: requiredEnv('DATABASE_URL'),
  RABBITMQ_URL: requiredEnv('RABBITMQ_URL'),
  SERVICE_TOKENS: {
    "service-a": requiredEnv("SERVICE_TOKEN_SERVICE_A"),
    "service-b": requiredEnv("SERVICE_TOKEN_SERVICE_B"),
    "test-admin": requiredEnv("SERVICE_TOKEN_TEST_ADMIN"),
  } as Record<string, string>,
};
