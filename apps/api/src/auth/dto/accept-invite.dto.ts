import { createZodDto } from 'nestjs-zod';
import { AcceptInviteSchema } from '@salestrack/contracts';

export class AcceptInviteDto extends createZodDto(AcceptInviteSchema) {}
