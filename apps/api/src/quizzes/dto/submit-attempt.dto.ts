import { IsObject } from 'class-validator';

export class SubmitAttemptDto {
  @IsObject()
  answers!: Record<string, string>; // questionId -> selectedOptionId
}
