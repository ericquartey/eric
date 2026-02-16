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
exports.IssuesService = void 0;
const common_1 = require("@nestjs/common");
const project_access_service_1 = require("../common/services/project-access.service");
const prisma_service_1 = require("../prisma/prisma.service");
let IssuesService = class IssuesService {
    prisma;
    projectAccessService;
    constructor(prisma, projectAccessService) {
        this.prisma = prisma;
        this.projectAccessService = projectAccessService;
    }
    async create(dto, user) {
        await this.projectAccessService.assertProjectAccess(user, dto.projectId);
        return this.prisma.issue.create({
            data: {
                ...dto,
                createdById: user.id,
            },
            include: {
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                assignee: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async list(user, projectId, status, type) {
        const projectFilter = await this.projectAccessService.getProjectFilter(user, projectId);
        return this.prisma.issue.findMany({
            where: {
                ...projectFilter,
                status,
                type,
            },
            include: {
                machine: { select: { id: true, model: true, serialNumber: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                assignee: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, dto) {
        await this.ensureExists(id);
        return this.prisma.issue.update({ where: { id }, data: { status: dto.status } });
    }
    async ensureExists(id) {
        const issue = await this.prisma.issue.findUnique({ where: { id }, select: { id: true } });
        if (!issue) {
            throw new common_1.NotFoundException('Issue not found');
        }
    }
};
exports.IssuesService = IssuesService;
exports.IssuesService = IssuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        project_access_service_1.ProjectAccessService])
], IssuesService);
//# sourceMappingURL=issues.service.js.map