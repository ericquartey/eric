import { InstallOutcome } from '@prisma/client';
export declare class CreateReportDto {
    projectId: string;
    machineId: string;
    outcome: InstallOutcome;
    notes?: string;
}
