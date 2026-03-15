import { createZodDto } from 'nestjs-zod';
import { AssignCourseSchema } from '@salestrack/contracts';

export class AssignCourseDto extends createZodDto(AssignCourseSchema) {}
