import { IsDateString, IsOptional } from 'class-validator';

export class DashboardCalendarQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
