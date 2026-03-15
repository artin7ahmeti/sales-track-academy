import {
  IsString, IsOptional, IsInt, IsArray, IsBoolean,
  Min, Max, ValidateNested, MinLength, ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class UpdateOptionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Ask an open-ended discovery question' })
  @IsString()
  @MinLength(1)
  text!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect!: boolean;
}

export class UpdateQuestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'What is the best first step in a cold call?' })
  @IsString()
  @MinLength(1)
  text!: string;

  @ApiProperty({ type: [UpdateOptionDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => UpdateOptionDto)
  options!: UpdateOptionDto[];
}

export class UpdateQuizDto {
  @ApiPropertyOptional({ example: 'Cold Calling Assessment' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ example: 'Quiz for module 1' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 70, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  passingScore?: number;

  @ApiPropertyOptional({ type: [UpdateQuestionDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  questions?: UpdateQuestionDto[];
}
