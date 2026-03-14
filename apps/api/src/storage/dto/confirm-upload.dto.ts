import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmUploadDto {
  @ApiProperty({ example: 'uploads/courses/crs_123/course-thumbnail.png' })
  @IsString()
  @MinLength(1)
  key!: string;
}
