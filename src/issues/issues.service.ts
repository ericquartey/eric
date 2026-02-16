import { Injectable, NotFoundException } from '@nestjs/common';
import { IssueStatus, IssueType } from '@prisma/client';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ProjectAccessService } from '../common/services/project-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';

@Injectable()
export class IssuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  async create(dto: CreateIssueDto, user: AuthenticatedUser) {
    await this.projectAccessService.assertProjectAccess(user, dto.projectId);

    return this.prisma.issue.create({
      data: {
        ...dto,
        createdById: user.id,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async list(
    user: AuthenticatedUser,
    projectId?: string,
    status?: IssueStatus,
    type?: IssueType,
  ) {
    const projectFilter = await this.projectAccessService.getProjectFilter(user, projectId);

    return this.prisma.issue.findMany({
      where: {
        ...projectFilter,
        status,
        type,
      },
      include: {
        machine: { select: { id: true, model: true, serialNumber: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateIssueStatusDto) {
    await this.ensureExists(id);
    return this.prisma.issue.update({ where: { id }, data: { status: dto.status } });
  }

  private async ensureExists(id: string): Promise<void> {
    const issue = await this.prisma.issue.findUnique({ where: { id }, select: { id: true } });
    if (!issue) {
      throw new NotFoundException('Issue not found');
    }
  }
}
