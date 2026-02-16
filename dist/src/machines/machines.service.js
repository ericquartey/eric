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
exports.MachinesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MachinesService = class MachinesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
        return this.prisma.machine.create({ data: dto });
    }
    findAll(projectId) {
        return this.prisma.machine.findMany({
            where: projectId ? { projectId } : undefined,
            include: { project: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, dto) {
        await this.ensureExists(id);
        return this.prisma.machine.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.ensureExists(id);
        return this.prisma.machine.delete({ where: { id } });
    }
    async ensureExists(id) {
        const item = await this.prisma.machine.findUnique({ where: { id }, select: { id: true } });
        if (!item) {
            throw new common_1.NotFoundException('Machine not found');
        }
    }
};
exports.MachinesService = MachinesService;
exports.MachinesService = MachinesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MachinesService);
//# sourceMappingURL=machines.service.js.map