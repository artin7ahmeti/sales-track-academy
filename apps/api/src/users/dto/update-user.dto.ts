import { IsString, IsOptional, IsEnum, IsBoolean, MinLength } from 'class-validator';
import { Role } from '@salestrack/contracts';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  avatarUrl?: string | null;
}
