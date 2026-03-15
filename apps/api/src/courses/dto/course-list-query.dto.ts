import { createZodDto } from 'nestjs-zod';
import { CourseListQuerySchema } from '@salestrack/contracts';

export class CourseListQueryDto extends createZodDto(CourseListQuerySchema) {
  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
