import { IsString, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadUrlDto {
  @ApiProperty({ example: 'course-thumbnail.png' })
  @IsString()
  @MinLength(1)
  fileName!: string;

  @ApiProperty({ example: 'image/png' })
  @IsString()
  @MinLength(1)
  contentType!: string;

  @ApiProperty({ enum: ['course-thumbnail', 'lesson-content'], example: 'course-thumbnail' })
  @IsEnum(['course-thumbnail', 'lesson-content'])
  entityType!: string;

  @ApiProperty({ example: 'crs_123' })
  @IsString()
  @MinLength(1)
  entityId!: string;
}
