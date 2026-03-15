import { createZodDto } from 'nestjs-zod';
import { CreateLessonSchema } from '@salestrack/contracts';

export class CreateLessonDto extends createZodDto(CreateLessonSchema) {}
