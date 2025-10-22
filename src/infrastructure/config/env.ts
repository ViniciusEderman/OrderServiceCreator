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
  RABBITMQ_URL: requiredEnv('RABBITMQ_URL')
};
