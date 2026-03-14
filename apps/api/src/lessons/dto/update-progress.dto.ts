import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({ example: 65, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  progressPct!: number;

  @ApiPropertyOptional({ example: 240, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lastPosition?: number;
}
