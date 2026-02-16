import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { InstallOutcome } from '@prisma/client';

export class CreateReportDto {
  @IsString()
  projectId!: string;

  @IsString()
  machineId!: string;

  @IsEnum(InstallOutcome)
  outcome!: InstallOutcome;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
