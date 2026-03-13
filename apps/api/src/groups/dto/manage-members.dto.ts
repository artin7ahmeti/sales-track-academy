import { IsArray, IsString } from 'class-validator';

export class ManageMembersDto {
  @IsArray()
  @IsString({ each: true })
  userIds!: string[];
}
