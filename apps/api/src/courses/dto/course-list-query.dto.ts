import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CourseListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
