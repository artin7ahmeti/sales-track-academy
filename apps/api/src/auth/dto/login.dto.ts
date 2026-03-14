import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@salestrack.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'test_password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
