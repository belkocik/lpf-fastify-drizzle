import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllConfigType, fastifyAdapter } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );
  const configService = app.get(ConfigService<AllConfigType>);

  const appPort = configService.getOrThrow('app.port', { infer: true });
  await app.listen(appPort ?? 3000);
}
bootstrap();
