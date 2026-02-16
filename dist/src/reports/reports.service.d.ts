import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ProjectAccessService } from '../common/services/project-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
export declare class ReportsService {
    private readonly prisma;
    private readonly projectAccessService;
    constructor(prisma: PrismaService, projectAccessService: ProjectAccessService);
    create(dto: CreateReportDto, user: AuthenticatedUser): Promise<{
        machine: {
            id: string;
            model: string;
            serialNumber: string;
        };
        installer: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        installerId: string;
        notes: string | null;
        machineId: string;
        outcome: import(".prisma/client").$Enums.InstallOutcome;
        date: Date;
    }>;
    list(user: AuthenticatedUser, projectId?: string, machineId?: string): Promise<({
        machine: {
            id: string;
            model: string;
            serialNumber: string;
        };
        installer: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        installerId: string;
        notes: string | null;
        machineId: string;
        outcome: import(".prisma/client").$Enums.InstallOutcome;
        date: Date;
    })[]>;
}
