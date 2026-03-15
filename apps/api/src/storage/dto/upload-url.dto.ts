import { createZodDto } from 'nestjs-zod';
import { UploadUrlSchema } from '@salestrack/contracts';

export class UploadUrlDto extends createZodDto(UploadUrlSchema) {}
