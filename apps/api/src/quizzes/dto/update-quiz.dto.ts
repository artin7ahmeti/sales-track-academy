import { createZodDto } from 'nestjs-zod';
import { UpdateQuizSchema } from '@salestrack/contracts';

export class UpdateQuizDto extends createZodDto(UpdateQuizSchema) {}
