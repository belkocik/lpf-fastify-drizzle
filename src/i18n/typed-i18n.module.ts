import { Global, Module } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TypedI18nService } from './typed-i18n.service';

@Global()
@Module({
  providers: [
    {
      provide: TypedI18nService,
      useExisting: I18nService,
    },
  ],
  exports: [TypedI18nService],
})
export class I18nExtrasModule {}
