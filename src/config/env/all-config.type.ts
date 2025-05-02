import { AppConfig } from 'src/config';
import { DatabaseConfig } from 'src/database/config';
import { AuthConfig } from 'src/auth/config';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
};
