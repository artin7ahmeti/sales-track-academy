import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'Artin Ahmeti' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'agent@salestrack.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'test_password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
