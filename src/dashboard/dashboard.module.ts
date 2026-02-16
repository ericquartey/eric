import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ReportsService } from '../reports/reports.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, ReportsService],
})
export class DashboardModule {}
