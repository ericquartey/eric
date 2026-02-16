import { Injectable } from '@nestjs/common';
import { IssueStatus, InstallOutcome, ProjectStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getPmOverview() {
    const [projectStatusGroups, installers, issuesByStatus, recentIssues, customerRows] =
      await Promise.all([
        this.prisma.project.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.user.findMany({
          where: { role: UserRole.INSTALLER },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            assignments: {
              select: {
                id: true,
                project: {
                  select: {
                    id: true,
                    name: true,
                    status: true,
                  },
                },
              },
            },
            reports: {
              select: {
                id: true,
                outcome: true,
              },
            },
          },
        }),
        this.prisma.issue.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.issue.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            project: { select: { id: true, name: true, customer: true } },
            machine: { select: { id: true, model: true, serialNumber: true } },
            createdBy: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
        this.prisma.project.findMany({
          select: {
            customer: true,
            id: true,
            name: true,
            status: true,
            location: true,
            expectedEndDate: true,
            issues: {
              select: {
                id: true,
                status: true,
              },
            },
            machines: { select: { id: true } },
          },
        }),
      ]);

    const cantieriTrend = {
      total: customerRows.length,
      byStatus: this.getStatusChart(projectStatusGroups),
    };

    const teamPerformance = this.buildTeamPerformance(installers);

    const customerComplaints = {
      total: recentIssues.length,
      byStatus: this.getIssueStatusChart(issuesByStatus),
      latest: recentIssues.map((issue) => ({
        id: issue.id,
        type: issue.type,
        status: issue.status,
        description: issue.description,
        createdAt: issue.createdAt,
        project: issue.project,
        machine: issue.machine,
        createdBy: issue.createdBy,
      })),
    };

    const customerRegistry = this.buildCustomerRegistry(customerRows);

    return {
      generatedAt: new Date().toISOString(),
      charts: {
        cantieriTrend,
        teamPerformance: {
          bestTeam: teamPerformance.bestTeam,
          worstTeam: teamPerformance.worstTeam,
          ranking: teamPerformance.ranking,
        },
        customerComplaints,
      },
      customerRegistry,
    };
  }

  private getStatusChart(
    groups: Array<{
      status: ProjectStatus;
      _count: { _all: number };
    }>,
  ) {
    const base = {
      [ProjectStatus.SCHEDULED]: 0,
      [ProjectStatus.IN_PROGRESS]: 0,
      [ProjectStatus.COMPLETED]: 0,
    };

    for (const row of groups) {
      base[row.status] = row._count._all;
    }

    return base;
  }

  private getIssueStatusChart(
    groups: Array<{
      status: IssueStatus;
      _count: { _all: number };
    }>,
  ) {
    const base = {
      [IssueStatus.OPEN]: 0,
      [IssueStatus.IN_PROGRESS]: 0,
      [IssueStatus.RESOLVED]: 0,
      [IssueStatus.CLOSED]: 0,
    };

    for (const row of groups) {
      base[row.status] = row._count._all;
    }

    return base;
  }

  private buildTeamPerformance(
    installers: Array<{
      id: string;
      firstName: string;
      lastName: string;
      assignments: Array<{
        id: string;
        project: {
          id: string;
          name: string;
          status: ProjectStatus;
        };
      }>;
      reports: Array<{
        id: string;
        outcome: InstallOutcome;
      }>;
    }>,
  ) {
    const ranking = installers
      .map((installer) => {
        const completedProjects = installer.assignments.filter(
          (assignment) => assignment.project.status === ProjectStatus.COMPLETED,
        ).length;
        const successfulReports = installer.reports.filter(
          (report) => report.outcome === InstallOutcome.OK,
        ).length;

        const score = completedProjects * 5 + successfulReports * 2 - installer.reports.length;

        return {
          installerId: installer.id,
          installerName: `${installer.firstName} ${installer.lastName}`,
          score,
          completedProjects,
          totalAssignments: installer.assignments.length,
          successfulReports,
          totalReports: installer.reports.length,
        };
      })
      .sort((a, b) => b.score - a.score);

    return {
      ranking,
      bestTeam: ranking[0] ?? null,
      worstTeam: ranking.at(-1) ?? null,
    };
  }

  private buildCustomerRegistry(
    customerRows: Array<{
      customer: string;
      id: string;
      name: string;
      status: ProjectStatus;
      location: string;
      expectedEndDate: Date | null;
      issues: Array<{ id: string; status: IssueStatus }>;
      machines: Array<{ id: string }>;
    }>,
  ) {
    const grouped = new Map<
      string,
      {
        customerName: string;
        projects: Array<{
          id: string;
          name: string;
          status: ProjectStatus;
          location: string;
          expectedEndDate: Date | null;
          machinesCount: number;
          openComplaints: number;
        }>;
      }
    >();

    for (const project of customerRows) {
      if (!grouped.has(project.customer)) {
        grouped.set(project.customer, {
          customerName: project.customer,
          projects: [],
        });
      }

      grouped.get(project.customer)?.projects.push({
        id: project.id,
        name: project.name,
        status: project.status,
        location: project.location,
        expectedEndDate: project.expectedEndDate,
        machinesCount: project.machines.length,
        openComplaints: project.issues.filter(
          (issue) => issue.status === IssueStatus.OPEN || issue.status === IssueStatus.IN_PROGRESS,
        ).length,
      });
    }

    return Array.from(grouped.values()).map((customer) => ({
      customerName: customer.customerName,
      projectsCount: customer.projects.length,
      openComplaints: customer.projects.reduce((sum, project) => sum + project.openComplaints, 0),
      projects: customer.projects,
    }));
  }
}
