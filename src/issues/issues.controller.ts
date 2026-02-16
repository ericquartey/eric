import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IssueStatus, IssueType } from '@prisma/client';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@Controller('issues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PM, Role.INSTALLER)
  create(@Body() dto: CreateIssueDto, @CurrentUser() user: AuthenticatedUser) {
    return this.issuesService.create(dto, user);
  }

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('projectId') projectId?: string,
    @Query('status') status?: IssueStatus,
    @Query('type') type?: IssueType,
  ) {
    return this.issuesService.list(user, projectId, status, type);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.PM)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateIssueStatusDto) {
    return this.issuesService.updateStatus(id, dto);
  }
}
