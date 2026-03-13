import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @IsInt()
  @Min(0)
  @Max(100)
  progressPct!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lastPosition?: number;
}
