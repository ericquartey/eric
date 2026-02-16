import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsString()
  customer!: string;

  @IsString()
  location!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  expectedEndDate?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsString()
  pmId!: string;
}
