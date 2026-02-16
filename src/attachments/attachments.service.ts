import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectAccessService } from '../common/services/project-access.service';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { AttachmentTargetType, UploadAttachmentDto } from './dto/upload-attachment.dto';

@Injectable()
export class AttachmentsService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'attachments');

  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAccessService: ProjectAccessService,
  ) {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async createAttachment(
    dto: UploadAttachmentDto,
    file: Express.Multer.File,
    user: AuthenticatedUser,
  ) {
    const targetProjectId = await this.resolveTargetProjectAndValidate(dto, user);

    const data = {
      url: `/uploads/attachments/${file.filename}`,
      mimeType: file.mimetype,
      fileName: file.originalname,
      sizeBytes: file.size,
      issueId: dto.targetType === AttachmentTargetType.ISSUE ? dto.targetId : null,
      reportId: dto.targetType === AttachmentTargetType.REPORT ? dto.targetId : null,
      chatId: dto.targetType === AttachmentTargetType.CHAT ? dto.targetId : null,
    };

    const attachment = await this.prisma.attachment.create({ data });

    return {
      ...attachment,
      projectId: targetProjectId,
    };
  }

  private async resolveTargetProjectAndValidate(
    dto: UploadAttachmentDto,
    user: AuthenticatedUser,
  ): Promise<string> {
    if (dto.targetType === AttachmentTargetType.ISSUE) {
      const issue = await this.prisma.issue.findUnique({
        where: { id: dto.targetId },
        select: { id: true, projectId: true },
      });

      if (!issue) {
        throw new NotFoundException('Issue not found');
      }

      await this.projectAccessService.assertProjectAccess(user, issue.projectId);
      return issue.projectId;
    }

    if (dto.targetType === AttachmentTargetType.REPORT) {
      const report = await this.prisma.installationReport.findUnique({
        where: { id: dto.targetId },
        select: { id: true, projectId: true },
      });

      if (!report) {
        throw new NotFoundException('Report not found');
      }

      await this.projectAccessService.assertProjectAccess(user, report.projectId);
      return report.projectId;
    }

    if (dto.targetType === AttachmentTargetType.CHAT) {
      const chatMessage = await this.prisma.chatMessage.findUnique({
        where: { id: dto.targetId },
        select: { id: true, projectId: true },
      });

      if (!chatMessage) {
        throw new NotFoundException('Chat message not found');
      }

      await this.projectAccessService.assertProjectAccess(user, chatMessage.projectId);
      return chatMessage.projectId;
    }

    throw new BadRequestException('Unsupported attachment target type');
  }
}
