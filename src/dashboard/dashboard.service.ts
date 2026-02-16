import { Injectable } from '@nestjs/common';
import { InstallOutcome, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ProjectAccessService } from '../common/services/project-access.service';
import { ReportsService } from '../reports/reports.service';
import { CreateReportDto } from '../reports/dto/create-report.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly reportsService: ReportsService,
  ) {}

  async getCalendar(user: AuthenticatedUser, from?: string, to?: string) {
    const startDate = from ? new Date(from) : undefined;
    const endDate = to ? new Date(to) : undefined;

    const dateFilter =
      startDate || endDate
        ? {
            OR: [
              {
                startDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              {
                endDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              {
                AND: [
                  { startDate: { lte: startDate } },
                  { OR: [{ endDate: null }, { endDate: { gte: endDate ?? startDate } }] },
                ],
              },
            ],
          }
        : {};

    const roleFilter = user.role === UserRole.INSTALLER ? { installerId: user.id } : {};

    const assignments = await this.prisma.assignment.findMany({
      where: {
        ...roleFilter,
        ...dateFilter,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            customer: true,
            location: true,
            status: true,
          },
        },
        installer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return {
      from: startDate ?? null,
      to: endDate ?? null,
      assignments,
    };
  }

  async getReportFormData(user: AuthenticatedUser, projectId?: string) {
    const projectFilter = await this.projectAccessService.getProjectFilter(user, projectId);

    const assignments = await this.prisma.assignment.findMany({
      where: {
        ...projectFilter,
        ...(user.role === UserRole.INSTALLER ? { installerId: user.id } : {}),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            customer: true,
            location: true,
            status: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    const projectIds = [...new Set(assignments.map((entry) => entry.projectId))];

    const machines = projectIds.length
      ? await this.prisma.machine.findMany({
          where: { projectId: { in: projectIds } },
          select: {
            id: true,
            model: true,
            serialNumber: true,
            projectId: true,
            installationStatus: true,
          },
          orderBy: { model: 'asc' },
        })
      : [];

    return {
      outcomes: Object.values(InstallOutcome),
      assignments: assignments.map((entry) => ({
        id: entry.id,
        startDate: entry.startDate,
        endDate: entry.endDate,
        project: entry.project,
      })),
      machines,
    };
  }

  submitReport(user: AuthenticatedUser, dto: CreateReportDto) {
    return this.reportsService.create(dto, user);
  }
}
