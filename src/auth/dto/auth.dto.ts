import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { tk } from 'src/i18n/utils';

export const AuthSchema = z.object({
  email: z
    .string({ message: tk('validation.type.string') })
    .email(tk('validation.email.invalid')),
  password: z
    .string({ message: tk('validation.type.string') })
    .min(8, tk('validation.password.minLength'))
    .max(32, tk('validation.password.maxLength')),
});

export class AuthRequestDto extends createZodDto(AuthSchema) {}
