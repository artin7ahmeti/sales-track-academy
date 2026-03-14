import { IsString, IsOptional, IsEnum, IsObject, IsInt, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: 'Opening a Sales Conversation' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional({ example: 'How to start calls with confidence.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ['VIDEO', 'AUDIO', 'PDF', 'TEXT'],
    example: 'VIDEO',
  })
  @IsEnum(['VIDEO', 'AUDIO', 'PDF', 'TEXT'])
  type!: string;

  @ApiProperty({
    example: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    description: 'Lesson payload, e.g. { url } for media/PDF or { text } for TEXT lessons',
  })
  @IsObject()
  content!: Record<string, unknown>;

  @ApiPropertyOptional({ example: 600, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;
}
