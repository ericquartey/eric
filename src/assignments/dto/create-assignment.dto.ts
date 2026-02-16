import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  projectId!: string;

  @IsString()
  installerId!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
