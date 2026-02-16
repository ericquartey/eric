import { MachineInstallStatus } from '@prisma/client';
export declare class CreateMachineDto {
    model: string;
    serialNumber: string;
    projectId: string;
    installationStatus?: MachineInstallStatus;
    notes?: string;
}
