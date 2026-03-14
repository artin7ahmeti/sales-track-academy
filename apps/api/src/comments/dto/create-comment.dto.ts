import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great explanation on handling objections.' })
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiPropertyOptional({ example: 'cmt_123', description: 'Parent comment id for threaded reply' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
