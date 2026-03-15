import { createZodDto } from 'nestjs-zod';
import { CreateGroupSchema } from '@salestrack/contracts';

export class CreateGroupDto extends createZodDto(CreateGroupSchema) {}
