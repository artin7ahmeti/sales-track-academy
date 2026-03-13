import { IsString, IsOptional, IsEnum, IsObject, IsInt, Min, MinLength } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['VIDEO', 'AUDIO', 'PDF', 'TEXT'])
  type!: string;

  @IsObject()
  content!: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;
}
