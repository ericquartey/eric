import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { DashboardCalendarQueryDto } from './dto/dashboard-calendar-query.dto';
import { ReportFormQueryDto } from './dto/report-form-query.dto';
import { CreateReportDto } from '../reports/dto/create-report.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('calendar')
  getCalendar(@CurrentUser() user: AuthenticatedUser, @Query() query: DashboardCalendarQueryDto) {
    return this.dashboardService.getCalendar(user, query.from, query.to);
  }

  @Get('report-form')
  getReportForm(@CurrentUser() user: AuthenticatedUser, @Query() query: ReportFormQueryDto) {
    return this.dashboardService.getReportFormData(user, query.projectId);
  }

  @Post('report-form')
  submitReport(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReportDto) {
    return this.dashboardService.submitReport(user, dto);
  }
}
