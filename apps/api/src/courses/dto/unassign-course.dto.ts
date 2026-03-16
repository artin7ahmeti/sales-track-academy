import { createZodDto } from 'nestjs-zod';
import { UnassignCourseSchema } from '@salestrack/contracts';

export class UnassignCourseDto extends createZodDto(UnassignCourseSchema) {}
