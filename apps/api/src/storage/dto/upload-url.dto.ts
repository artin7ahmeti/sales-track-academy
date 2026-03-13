import { IsString, IsEnum, MinLength } from 'class-validator';

export class UploadUrlDto {
  @IsString()
  @MinLength(1)
  fileName!: string;

  @IsString()
  @MinLength(1)
  contentType!: string;

  @IsEnum(['course-thumbnail', 'lesson-content'])
  entityType!: string;

  @IsString()
  @MinLength(1)
  entityId!: string;
}
