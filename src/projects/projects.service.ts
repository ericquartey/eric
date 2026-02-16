import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        expectedEndDate: dto.expectedEndDate ? new Date(dto.expectedEndDate) : null,
      },
      include: { pm: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  findAll() {
    return this.prisma.project.findMany({
      include: {
        pm: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { machines: true, assignments: true, issues: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.project.findUnique({
      where: { id },
      include: {
        pm: { select: { id: true, firstName: true, lastName: true } },
        machines: true,
        assignments: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Project not found');
    }

    return item;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureExists(id);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        expectedEndDate: dto.expectedEndDate
          ? new Date(dto.expectedEndDate)
          : dto.expectedEndDate === null
            ? null
            : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.project.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const item = await this.prisma.project.findUnique({ where: { id }, select: { id: true } });
    if (!item) {
      throw new NotFoundException('Project not found');
    }
  }
}
