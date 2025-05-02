import { registerAs } from '@nestjs/config';
import { databaseSchema } from './database.schema';
import { tryParseEnv } from 'src/utils/try-parse-env';

export const databaseConfig = registerAs('database', () => {
  const env = tryParseEnv(databaseSchema);
  return {
    url: env.DATABASE_URL,
  };
});
