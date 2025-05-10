import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  Type,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ZodSchema } from 'zod';

interface ZodDtoClass {
  schema: ZodSchema<unknown>;
}

@Injectable()
export class ZodI18nValidationPipe implements PipeTransform {
  constructor(private readonly i18n: I18nService) {}

  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    const metatype = metadata.metatype as Type<unknown> | undefined;

    if (
      !metatype ||
      typeof metatype !== 'function' ||
      !('schema' in metatype)
    ) {
      return value;
    }

    const schema = (metatype as ZodDtoClass).schema;
    const result = schema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    const errors = await Promise.all(
      result.error.errors.map(async (err) => {
        const path = err.path.join('.') || 'field';
        const message = await this.i18n.translate(err.message, {
          args: { path },
        });

        return { field: path, message };
      }),
    );

    throw new UnprocessableEntityException(errors);
  }
}
