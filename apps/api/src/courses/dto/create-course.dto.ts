import { createZodDto } from 'nestjs-zod';
import { CreateCourseSchema } from '@salestrack/contracts';

export class CreateCourseDto extends createZodDto(CreateCourseSchema) {}
