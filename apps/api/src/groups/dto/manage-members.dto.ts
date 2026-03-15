import { createZodDto } from 'nestjs-zod';
import { ManageMembersSchema } from '@salestrack/contracts';

export class ManageMembersDto extends createZodDto(ManageMembersSchema) {}
