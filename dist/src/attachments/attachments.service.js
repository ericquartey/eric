"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsService = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const project_access_service_1 = require("../common/services/project-access.service");
const upload_attachment_dto_1 = require("./dto/upload-attachment.dto");
let AttachmentsService = class AttachmentsService {
    prisma;
    projectAccessService;
    uploadDir = (0, path_1.join)(process.cwd(), 'uploads', 'attachments');
    constructor(prisma, projectAccessService) {
        this.prisma = prisma;
        this.projectAccessService = projectAccessService;
        if (!(0, fs_1.existsSync)(this.uploadDir)) {
            (0, fs_1.mkdirSync)(this.uploadDir, { recursive: true });
        }
    }
    async createAttachment(dto, file, user) {
        const targetProjectId = await this.resolveTargetProjectAndValidate(dto, user);
        const data = {
            url: `/uploads/attachments/${file.filename}`,
            mimeType: file.mimetype,
            fileName: file.originalname,
            sizeBytes: file.size,
            issueId: dto.targetType === upload_attachment_dto_1.AttachmentTargetType.ISSUE ? dto.targetId : null,
            reportId: dto.targetType === upload_attachment_dto_1.AttachmentTargetType.REPORT ? dto.targetId : null,
            chatId: dto.targetType === upload_attachment_dto_1.AttachmentTargetType.CHAT ? dto.targetId : null,
        };
        const attachment = await this.prisma.attachment.create({ data });
        return {
            ...attachment,
            projectId: targetProjectId,
        };
    }
    async resolveTargetProjectAndValidate(dto, user) {
        if (dto.targetType === upload_attachment_dto_1.AttachmentTargetType.ISSUE) {
            const issue = await this.prisma.issue.findUnique({
                where: { id: dto.targetId },
                select: { id: true, projectId: true },
            });
            if (!issue) {
                throw new common_1.NotFoundException('Issue not found');
            }
            await this.projectAccessService.assertProjectAccess(user, issue.projectId);
            return issue.projectId;
        }
        if (dto.targetType === upload_attachment_dto_1.AttachmentTargetType.REPORT) {
            const report = await this.prisma.installationReport.findUnique({
                where: { id: dto.targetId },
                select: { id: true, projectId: true },
            });
            if (!report) {
                throw new common_1.NotFoundException('Report not found');
            }
            await this.projectAccessService.assertProjectAccess(user, report.projectId);
            return report.projectId;
        }
        if (dto.targetType === upload_attachment_dto_1.AttachmentTargetType.CHAT) {
            const chatMessage = await this.prisma.chatMessage.findUnique({
                where: { id: dto.targetId },
                select: { id: true, projectId: true },
            });
            if (!chatMessage) {
                throw new common_1.NotFoundException('Chat message not found');
            }
            await this.projectAccessService.assertProjectAccess(user, chatMessage.projectId);
            return chatMessage.projectId;
        }
        throw new common_1.BadRequestException('Unsupported attachment target type');
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        project_access_service_1.ProjectAccessService])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map