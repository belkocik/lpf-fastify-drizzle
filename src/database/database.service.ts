import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private client: ReturnType<typeof postgres>;
  private migrationClient: ReturnType<typeof postgres>;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const dbUrl = configService.getOrThrow('database.url', { infer: true });

    this.client = postgres(dbUrl);
    this.migrationClient = postgres(dbUrl, { max: 1 });
  }

  async onModuleInit() {
    this.logger.log('Starting database migrations');

    try {
      const migrator = drizzle(this.migrationClient, { schema, logger: true });

      await migrate(migrator, {
        migrationsFolder: './src/database/migrations',
        migrationsSchema: 'public',
      });

      this.logger.log('Database migrations completed');
    } catch (error) {
      this.logger.error(
        'Migration failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    } finally {
      await this.migrationClient.end();
    }
  }

  get db() {
    return drizzle(this.client, { schema, logger: true });
  }
}
