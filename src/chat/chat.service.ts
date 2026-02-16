import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ProjectAccessService } from '../common/services/project-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  async create(dto: CreateChatMessageDto, user: AuthenticatedUser) {
    await this.projectAccessService.assertProjectAccess(user, dto.projectId);

    return this.prisma.chatMessage.create({
      data: {
        ...dto,
        senderId: user.id,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async list(user: AuthenticatedUser, projectId: string) {
    await this.projectAccessService.assertProjectAccess(user, projectId);

    return this.prisma.chatMessage.findMany({
      where: { projectId },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
