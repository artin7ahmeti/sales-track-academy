import { createZodDto } from 'nestjs-zod';
import { InviteUserSchema } from '@salestrack/contracts';

export class InviteUserDto extends createZodDto(InviteUserSchema) {}
