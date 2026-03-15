import { createZodDto } from 'nestjs-zod';
import { UpdateUserSchema } from '@salestrack/contracts';

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
