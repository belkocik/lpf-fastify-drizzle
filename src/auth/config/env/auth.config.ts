import { registerAs } from '@nestjs/config';
import { authSchema } from './auth.schema';
import { tryParseEnv } from 'src/utils/try-parse-env';

export const authConfig = registerAs('auth', () => {
  const env = tryParseEnv(authSchema);
  return {
    jwtSecret: env.JWT_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  };
});
