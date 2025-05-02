import { registerAs } from '@nestjs/config';
import { tryParseEnv } from 'src/config';
import { authSchema } from './auth.schema';

export const authConfig = registerAs('auth', () => {
  const env = tryParseEnv(authSchema);
  return {
    jwtSecret: env.JWT_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  };
});
