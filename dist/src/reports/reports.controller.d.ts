import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
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
