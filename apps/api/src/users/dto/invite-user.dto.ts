import { IsEmail, IsEnum, IsOptional, IsArray, IsString } from 'class-validator';
import { Role } from '@salestrack/contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({ example: 'new.agent@salestrack.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: Role, example: Role.AGENT })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({
    type: [String],
    example: ['grp_123', 'grp_456'],
    description: 'Optional group ids to auto-assign after accepting invitation',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];
}
