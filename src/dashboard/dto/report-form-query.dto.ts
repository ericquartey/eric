import { IsOptional, IsString } from 'class-validator';

export class ReportFormQueryDto {
  @IsOptional()
  @IsString()
  projectId?: string;
}
