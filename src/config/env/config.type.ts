import { AppConfig } from './app-config.type';
import { DatabaseConfig } from 'src/database/config';
import { AuthConfig } from 'src/auth/config';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
};
