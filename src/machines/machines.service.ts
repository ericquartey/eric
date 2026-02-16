import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

@Injectable()
export class MachinesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateMachineDto) {
    return this.prisma.machine.create({ data: dto });
  }

  findAll(projectId?: string) {
    return this.prisma.machine.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        project: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateMachineDto) {
    await this.ensureExists(id);
    return this.prisma.machine.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.machine.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const item = await this.prisma.machine.findUnique({ where: { id }, select: { id: true } });
    if (!item) {
      throw new NotFoundException('Machine not found');
    }
  }
}
