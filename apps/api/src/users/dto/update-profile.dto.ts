import { createZodDto } from 'nestjs-zod';
import { UpdateProfileSchema } from '@salestrack/contracts';

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
