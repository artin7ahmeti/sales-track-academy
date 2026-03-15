import { createZodDto } from 'nestjs-zod';
import { CreateCommentSchema } from '@salestrack/contracts';

export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}
