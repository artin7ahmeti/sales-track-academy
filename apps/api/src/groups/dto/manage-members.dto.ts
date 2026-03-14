import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManageMembersDto {
  @ApiProperty({ type: [String], example: ['usr_123', 'usr_456'] })
  @IsArray()
  @IsString({ each: true })
  userIds!: string[];
}
