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

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: ReturnType<typeof postgres>;
  private migrationClient: ReturnType<typeof postgres>;
  private readonly logger = new Logger(DatabaseService.name);
  public db: ReturnType<typeof drizzle>;

  constructor(private configService: ConfigService<AllConfigType>) {
    const dbUrl = configService.getOrThrow('database.url', { infer: true });
    this.client = postgres(dbUrl);
    this.migrationClient = postgres(dbUrl, { max: 1 });

    this.db = this.createDrizzleInstance(this.client);
  }

  private createDrizzleInstance(client: ReturnType<typeof postgres>) {
    return drizzle(client, { schema, logger: true });
  }

  async onModuleInit() {
    this.logger.log('Starting database migrations');

    try {
      const migrator = this.createDrizzleInstance(this.migrationClient);
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
    await Promise.all([this.migrationClient.end(), this.client.end()]);
  }
}
