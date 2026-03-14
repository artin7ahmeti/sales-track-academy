import { IsArray, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AssignCourseDto {
  @ApiPropertyOptional({ type: [String], example: ['usr_123', 'usr_456'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({ type: [String], example: ['grp_123', 'grp_456'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];

  @ApiPropertyOptional({
    example: '2026-06-30T00:00:00.000Z',
    description: 'ISO date string for assignment due date',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
