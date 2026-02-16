import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IssueType } from '@prisma/client';

export class CreateIssueDto {
  @IsEnum(IssueType)
  type!: IssueType;

  @IsString()
  description!: string;

  @IsString()
  projectId!: string;

  @IsOptional()
  @IsString()
  machineId?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
