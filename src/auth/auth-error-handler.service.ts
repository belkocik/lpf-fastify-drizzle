import { ConflictException, Injectable } from '@nestjs/common';
import { PostgresError } from 'postgres';
import { ErrorHandlerService } from 'src/common/services/error-handler.service';
import { TypedI18nService } from 'src/i18n/typed-i18n.service';

@Injectable()
export class AuthErrorHandlerService {
  constructor(
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly i18n: TypedI18nService,
  ) {}

  handleAuthError(error: unknown): never {
    // Jeśli jest to błąd związany z autoryzacją, obsługujemy go tutaj
    if (error instanceof Error) {
      // Możesz dodać logikę specyficzną dla Auth, np. sprawdzanie różnych wyjątków
      if (error instanceof PostgresError) {
        if (error.code === '23505') {
          throw new ConflictException(this.i18n.t('auth.emailAlreadyExists'));
        }
      }
      this.errorHandlerService.handleError(error); // Przekazuje błąd do globalnego handlera
    }

    // Jeśli coś poszło nie tak, wywołaj globalny handler
    this.errorHandlerService.handleError(error);
  }
}
