import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostgresError } from 'postgres';
import { TypedI18nService } from 'src/i18n/typed-i18n.service';

@Injectable()
export class ErrorHandlerService {
  constructor(private readonly i18n: TypedI18nService) {}

  handleError(error: unknown): never {
    if (error instanceof PostgresError) {
      // Obsługuje błędy PostgreSQL
      switch (error.code) {
        case '23505': // Kod błędu dla "UNIQUE VIOLATION"
          throw new BadRequestException(
            this.i18n.t('postgres.uniqueViolation'),
          );

        case '23503': // Kod błędu dla "FOREIGN KEY VIOLATION"
          throw new BadRequestException(
            this.i18n.t('postgres.foreignKeyViolation'),
          );

        case '23502': // Kod błędu dla "NOT NULL VIOLATION"
          throw new BadRequestException(
            this.i18n.t('postgres.notNullViolation'),
          );

        default:
          throw new BadRequestException(this.i18n.t('postgres.databaseError'));
      }
    } else if (error instanceof Error) {
      // Obsługuje ogólne błędy
      throw new InternalServerErrorException(
        this.i18n.t('postgres.generalError'),
      );
    }

    // Domyślna obsługa dla błędów, które nie są zdefiniowane
    throw new InternalServerErrorException(
      this.i18n.t('postgres.unknownError'),
    );
  }
}
