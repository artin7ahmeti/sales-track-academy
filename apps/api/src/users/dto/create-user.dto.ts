import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '@salestrack/contracts';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'agent@salestrack.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Sales Agent' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'test_password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: Role, example: Role.AGENT })
  @IsEnum(Role)
  role!: Role;
}
