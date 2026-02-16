import { IsEnum } from 'class-validator';
import { IssueStatus } from '@prisma/client';

export class UpdateIssueStatusDto {
  @IsEnum(IssueStatus)
  status!: IssueStatus;
}
