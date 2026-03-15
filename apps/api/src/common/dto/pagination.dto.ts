import { createZodDto } from 'nestjs-zod';
import { PaginationParamsSchema } from '@salestrack/contracts';

export class PaginationQueryDto extends createZodDto(PaginationParamsSchema) {
  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
