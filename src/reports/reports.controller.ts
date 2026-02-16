import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PM, Role.INSTALLER)
  create(@Body() dto: CreateReportDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.create(dto, user);
  }

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('projectId') projectId?: string,
    @Query('machineId') machineId?: string,
  ) {
    return this.reportsService.list(user, projectId, machineId);
  }
}
