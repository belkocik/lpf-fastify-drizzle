import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType, appConfig } from './config';
import { databaseConfig } from './database/config';
import { DatabaseModule } from './database/database.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { authConfig } from './auth/config/env';
import { UsersModule } from './users/users.module';
import * as path from 'path';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { I18nExtrasModule } from './i18n/typed-i18n.module';
import { ZodI18nValidationPipe } from './pipes/zod-i18n-validation.pipe';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.dev', '.env'],
      load: [appConfig, databaseConfig, authConfig],
    }),
    DatabaseModule,
    AuthModule,
    I18nExtrasModule,
    UsersModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000,
          limit: 50,
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 1000,
        },
      ],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: {
          path: path.join(__dirname, '..', '/i18n/'),
          watch: true,
        },
        typesOutputPath: path.join(
          process.cwd(),
          'src/generated/i18n.generated.ts',
        ),
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodI18nValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
