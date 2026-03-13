import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Role } from '@salestrack/contracts';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class UserListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
