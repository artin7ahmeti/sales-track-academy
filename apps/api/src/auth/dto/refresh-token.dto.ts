import { createZodDto } from 'nestjs-zod';
import { RefreshTokenSchema } from '@salestrack/contracts';

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
