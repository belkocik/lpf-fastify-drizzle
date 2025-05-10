import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllConfigType, fastifyAdapter } from './config';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyApiReference from '@scalar/fastify-api-reference';
import fastifySwagger from '@fastify/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      cors: true,
    },
  );
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters({
      in: 'header',
      required: false,
      name:
        configService.get('app.headerLanguage', { infer: true }) ||
        'x-custom-lang',
      schema: {
        example: 'en',
      },
    })
    .build();

  patchNestJsSwagger();

  const document = SwaggerModule.createDocument(app, options);

  const fastify = app.getHttpAdapter().getInstance();
  fastify.register(fastifySwagger);
  await fastify.register(fastifyApiReference, {
    routePrefix: '/docs',
    configuration: {
      spec: {
        url: '/swagger.json',
      },
      theme: 'kepler',
      layout: 'classic',
      defaultHttpClient: { targetKey: 'js', clientKey: 'fetch' },
    },
  });
  fastify.get('/swagger.json', async (request, reply) => {
    reply.send(document);
  });

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
bootstrap();
