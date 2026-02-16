import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class ProjectAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertProjectAccess(user: AuthenticatedUser, projectId: string): Promise<void> {
    if (user.role !== UserRole.INSTALLER) {
      return;
    }

    const assignment = await this.prisma.assignment.findFirst({
      where: {
        projectId,
        installerId: user.id,
      },
      select: { id: true },
    });

    if (!assignment) {
      throw new ForbiddenException('No access to this project');
    }
  }

  async getProjectFilter(user: AuthenticatedUser, projectId?: string): Promise<{ projectId?: string | { in: string[] } }> {
    if (user.role !== UserRole.INSTALLER) {
      return projectId ? { projectId } : {};
    }

    if (projectId) {
      await this.assertProjectAccess(user, projectId);
      return { projectId };
    }

    const assignments = await this.prisma.assignment.findMany({
      where: { installerId: user.id },
      select: { projectId: true },
    });

    return {
      projectId: { in: assignments.map((entry) => entry.projectId) },
    };
  }
}
