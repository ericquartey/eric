import { PrismaService } from '../prisma/prisma.service';
import { ProjectAccessService } from '../common/services/project-access.service';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
export declare class AttachmentsService {
    private readonly prisma;
    private readonly projectAccessService;
    private readonly uploadDir;
    constructor(prisma: PrismaService, projectAccessService: ProjectAccessService);
    createAttachment(dto: UploadAttachmentDto, file: Express.Multer.File, user: AuthenticatedUser): Promise<{
        projectId: string;
        id: string;
        createdAt: Date;
        url: string;
        mimeType: string;
        fileName: string;
        sizeBytes: number;
        issueId: string | null;
        reportId: string | null;
        chatId: string | null;
    }>;
    private resolveTargetProjectAndValidate;
}
