import { createZodDto } from 'nestjs-zod';
import { UpdateCommentSchema } from '@salestrack/contracts';

export class UpdateCommentDto extends createZodDto(UpdateCommentSchema) {}
