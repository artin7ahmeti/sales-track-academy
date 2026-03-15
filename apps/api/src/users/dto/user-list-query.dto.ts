import { createZodDto } from 'nestjs-zod';
import { UserListQuerySchema } from '@salestrack/contracts';

export class UserListQueryDto extends createZodDto(UserListQuerySchema) {
  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
