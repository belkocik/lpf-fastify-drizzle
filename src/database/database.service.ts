import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as postgres from 'postgres';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as schema from './schema';
import { AllConfigType } from 'src/config';

// Typowany konstruktor
type DrizzleFn = typeof drizzle<typeof schema>;
const Drizzle = drizzle as unknown as {
  new (...args: Parameters<DrizzleFn>): ReturnType<DrizzleFn>;
};

@Injectable()
export class DatabaseService
  extends Drizzle
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);
  private client: ReturnType<typeof postgres>;
  private migrationClient: ReturnType<typeof postgres>;

  constructor(private configService: ConfigService<AllConfigType>) {
    const dbUrl = configService.getOrThrow('database.url', { infer: true });

    const client = postgres(dbUrl);
    const migrationClient = postgres(dbUrl, { max: 1 });

    super(client, { schema, logger: true });

    this.client = client;
    this.migrationClient = migrationClient;

    // Upewniamy się, że dziedziczenie prototypu działa poprawnie
    Object.setPrototypeOf(Object.getPrototypeOf(this), Drizzle.prototype);
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

  async onModuleDestroy() {
    await Promise.all([this.client.end(), this.migrationClient.end()]);
  }
}
