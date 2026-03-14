import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Role } from '@salestrack/contracts';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'artin' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.AGENT })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
