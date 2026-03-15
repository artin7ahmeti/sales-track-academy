import { createZodDto } from 'nestjs-zod';
import { ReorderLessonsSchema } from '@salestrack/contracts';

export class ReorderLessonsDto extends createZodDto(ReorderLessonsSchema) {}
