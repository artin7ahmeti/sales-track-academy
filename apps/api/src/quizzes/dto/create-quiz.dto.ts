import { createZodDto } from 'nestjs-zod';
import { CreateQuizSchema } from '@salestrack/contracts';

export class CreateQuizDto extends createZodDto(CreateQuizSchema) {}
