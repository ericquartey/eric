import { BadRequestException, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ProjectAccessService } from '../common/services/project-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  async create(dto: CreateReportDto, user: AuthenticatedUser) {
    await this.projectAccessService.assertProjectAccess(user, dto.projectId);

    const machine = await this.prisma.machine.findUnique({
      where: { id: dto.machineId },
      select: { id: true, projectId: true },
    });

    if (!machine || machine.projectId !== dto.projectId) {
      throw new BadRequestException('Machine does not belong to selected project');
    }

    return this.prisma.installationReport.create({
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        installerId: user.id,
      },
      include: {
        machine: { select: { id: true, model: true, serialNumber: true } },
        installer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async list(user: AuthenticatedUser, projectId?: string, machineId?: string) {
    const projectFilter = await this.projectAccessService.getProjectFilter(user, projectId);

    return this.prisma.installationReport.findMany({
      where: {
        ...projectFilter,
        machineId,
      },
      include: {
        machine: { select: { id: true, model: true, serialNumber: true } },
        installer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    });
  }
}
