import { FastifyAdapter } from '@nestjs/platform-fastify';

export const fastifyAdapter: FastifyAdapter = new FastifyAdapter({
  logger: {
    transport: {
      target: 'pino-pretty',
    },
  },
});
