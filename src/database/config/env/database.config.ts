import { registerAs } from '@nestjs/config';
import { tryParseEnv } from 'src/config';
import { databaseSchema } from './database.schema';

export const databaseConfig = registerAs('database', () => {
  const env = tryParseEnv(databaseSchema);
  return {
    url: env.DATABASE_URL,
  };
});
