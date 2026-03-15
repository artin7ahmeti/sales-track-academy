import { createZodDto } from 'nestjs-zod';
import { UpdateProgressSchema } from '@salestrack/contracts';

export class UpdateProgressDto extends createZodDto(UpdateProgressSchema) {}
