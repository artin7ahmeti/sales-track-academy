import { createZodDto } from 'nestjs-zod';
import { UpdateGroupSchema } from '@salestrack/contracts';

export class UpdateGroupDto extends createZodDto(UpdateGroupSchema) {}
