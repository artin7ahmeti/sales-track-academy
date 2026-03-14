import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAttemptDto {
  @ApiProperty({
    example: {
      qst_123: 'opt_abc',
      qst_456: 'opt_def',
    },
    description: 'Map of questionId -> selectedOptionId',
  })
  @IsObject()
  answers!: Record<string, string>; // questionId -> selectedOptionId
}
