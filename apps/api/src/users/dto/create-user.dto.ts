import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '@salestrack/contracts';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(Role)
  role!: Role;
}
