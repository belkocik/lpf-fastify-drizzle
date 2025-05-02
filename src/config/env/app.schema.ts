import { z } from 'zod';

export const appSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  APP_NAME: z.string().default('NestJS App'),
  APP_PORT: z.coerce.number().min(0).max(65535).optional(),
  API_PREFIX: z.string().optional(),
  WORKING_DIRECTORY: z.string().optional(),
});
