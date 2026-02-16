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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
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
    async findOne(id) {
        const item = await this.prisma.project.findUnique({
            where: { id },
            include: {
                pm: { select: { id: true, firstName: true, lastName: true } },
                machines: true,
                assignments: true,
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('Project not found');
        }
        return item;
    }
    async update(id, dto) {
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
    async remove(id) {
        await this.ensureExists(id);
        return this.prisma.project.delete({ where: { id } });
    }
    async ensureExists(id) {
        const item = await this.prisma.project.findUnique({ where: { id }, select: { id: true } });
        if (!item) {
            throw new common_1.NotFoundException('Project not found');
        }
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map