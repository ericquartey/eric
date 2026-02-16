import { BadRequestException, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssignmentDto) {
    const installer = await this.prisma.user.findUnique({
      where: { id: dto.installerId },
      select: { id: true, role: true },
    });

    if (!installer || installer.role !== UserRole.INSTALLER) {
      throw new BadRequestException('installerId must belong to an INSTALLER user');
    }

    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    if (endDate && endDate < startDate) {
      throw new BadRequestException('endDate must be greater than or equal to startDate');
    }

    const overlappingAssignment = await this.prisma.assignment.findFirst({
      where: {
        installerId: dto.installerId,
        AND: [
          { startDate: { lte: endDate ?? startDate } },
          { OR: [{ endDate: null }, { endDate: { gte: startDate } }] },
        ],
      },
      select: { id: true },
    });

    if (overlappingAssignment) {
      throw new BadRequestException('Installer already has an assignment in this time window');
    }

    return this.prisma.assignment.create({
      data: {
        ...dto,
        startDate,
        endDate,
      },
      include: {
        project: { select: { id: true, name: true, location: true } },
        installer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  list(user: AuthenticatedUser, projectId?: string, installerId?: string) {
    const where =
      user.role === UserRole.INSTALLER
        ? { installerId: user.id }
        : {
            projectId,
            installerId,
          };

    return this.prisma.assignment.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        installer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }
}
