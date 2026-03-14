import { IsString, IsOptional, IsObject, IsInt, Min, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLessonDto {
  @ApiPropertyOptional({ example: 'Updated lesson title' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated lesson description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: { text: 'Updated text content...' } })
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 480, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;
}
