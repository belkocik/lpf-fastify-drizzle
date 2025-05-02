import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import type { I18nTranslations } from 'src/generated/i18n.generated';

/**
 * TypedI18nService is a wrapper around the I18nService from nestjs-i18n
 */
@Injectable()
export class TypedI18nService extends I18nService<I18nTranslations> {}
