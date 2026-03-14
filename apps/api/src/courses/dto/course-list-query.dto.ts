import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CourseListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'cold calling' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
