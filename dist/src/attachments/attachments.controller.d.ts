import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    upload(dto: UploadAttachmentDto, file: Express.Multer.File, user: AuthenticatedUser): Promise<{
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
}
