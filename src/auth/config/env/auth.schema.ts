import { z } from 'zod';

export const authSchema = z.object({
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
});
