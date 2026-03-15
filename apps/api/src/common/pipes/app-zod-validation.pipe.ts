import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

export const AppZodValidationPipe = createZodValidationPipe({
  createValidationException: (error) =>
    new BadRequestException({
      message: 'Validation failed',
      errors: error instanceof ZodError ? error.issues : [],
    }),
});
