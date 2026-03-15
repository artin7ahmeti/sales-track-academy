import { createZodDto } from 'nestjs-zod';
import { LoginSchema } from '@salestrack/contracts';

export class LoginDto extends createZodDto(LoginSchema) {}
