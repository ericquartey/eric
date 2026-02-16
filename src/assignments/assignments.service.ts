import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAssignmentDto) {
    return this.prisma.assignment.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
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
