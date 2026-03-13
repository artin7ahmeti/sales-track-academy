import { IsArray, IsOptional, IsString, IsDateString } from 'class-validator';

export class AssignCourseDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
