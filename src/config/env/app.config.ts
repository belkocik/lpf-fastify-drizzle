import { registerAs } from '@nestjs/config';
import { appSchema } from './app.schema';
import { tryParseEnv } from 'src/utils/try-parse-env';

export const appConfig = registerAs('app', () => {
  const env = tryParseEnv(appSchema);
  return {
    nodeEnv: env.NODE_ENV ?? 'development',
    name: env.APP_NAME ?? 'app',
    workingDirectory: env.WORKING_DIRECTORY || process.cwd(),
    port: env.APP_PORT ?? 3000,
    apiPrefix: env.API_PREFIX ?? 'api',
    fallbackLanguage: env.APP_FALLBACK_LANGUAGE || 'en',
    headerLanguage: env.APP_HEADER_LANGUAGE || 'x-custom-lang',
  };
});
