import { IsArray, IsString } from 'class-validator';

export class ReorderLessonsDto {
  @IsArray()
  @IsString({ each: true })
  lessonIds!: string[];
}
