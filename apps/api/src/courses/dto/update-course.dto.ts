import { createZodDto } from 'nestjs-zod';
import { UpdateCourseSchema } from '@salestrack/contracts';

export class UpdateCourseDto extends createZodDto(UpdateCourseSchema) {}
