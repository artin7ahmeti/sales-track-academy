import { createZodDto } from 'nestjs-zod';
import { SubmitAttemptSchema } from '@salestrack/contracts';

export class SubmitAttemptDto extends createZodDto(SubmitAttemptSchema) {}
