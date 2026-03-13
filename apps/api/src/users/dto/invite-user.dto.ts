import { IsEmail, IsEnum, IsOptional, IsArray, IsString } from 'class-validator';
import { Role } from '@salestrack/contracts';

export class InviteUserDto {
  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];
}
