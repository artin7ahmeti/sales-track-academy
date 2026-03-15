import { createZodDto } from 'nestjs-zod';
import { SignupSchema } from '@salestrack/contracts';

export class SignupDto extends createZodDto(SignupSchema) {}
