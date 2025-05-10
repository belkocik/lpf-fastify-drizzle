import type { I18nTranslations } from 'src/generated/i18n.generated';

// Rekursywne wydobywanie wszystkich kluczy z zagnieżdżonych obiektów
type Flatten<T, Prefix extends string = ''> =
  T extends Record<string, any>
    ? {
        [K in keyof T]: T[K] extends Record<string, any>
          ? Flatten<T[K], `${Prefix}${K & string}.`>
          : `${Prefix}${K & string}`;
      }[keyof T]
    : never;

// Typ dla wszystkich kluczy tłumaczeń w I18nTranslations
type TranslationKeys = Flatten<I18nTranslations>;

// Funkcja pomocnicza do mapowania kluczy tłumaczeń na stringi
export const tk = <T extends TranslationKeys>(key: T): string => key;
