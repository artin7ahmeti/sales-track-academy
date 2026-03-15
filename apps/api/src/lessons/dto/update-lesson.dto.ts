import { createZodDto } from 'nestjs-zod';
import { UpdateLessonSchema } from '@salestrack/contracts';

export class UpdateLessonDto extends createZodDto(UpdateLessonSchema) {}
