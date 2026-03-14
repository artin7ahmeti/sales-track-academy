import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInviteDto {
  @ApiProperty({ example: 'inv_abc123token' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'New Agent' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'test_password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
