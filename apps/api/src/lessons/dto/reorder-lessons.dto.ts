import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderLessonsDto {
  @ApiProperty({
    type: [String],
    example: ['lesson_1', 'lesson_2', 'lesson_3'],
    description: 'Ordered lesson id list',
  })
  @IsArray()
  @IsString({ each: true })
  lessonIds!: string[];
}
