import { createZodDto } from 'nestjs-zod';
import { ConfirmUploadSchema } from '@salestrack/contracts';

export class ConfirmUploadDto extends createZodDto(ConfirmUploadSchema) {}
