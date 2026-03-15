import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema } from '@salestrack/contracts';

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
