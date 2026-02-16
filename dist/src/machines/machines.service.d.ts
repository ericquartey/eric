import { PrismaService } from '../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
export declare class MachinesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateMachineDto): import(".prisma/client").Prisma.Prisma__MachineClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        model: string;
        serialNumber: string;
        installationStatus: import(".prisma/client").$Enums.MachineInstallStatus;
        notes: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(projectId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        project: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        model: string;
        serialNumber: string;
        installationStatus: import(".prisma/client").$Enums.MachineInstallStatus;
        notes: string | null;
    })[]>;
    update(id: string, dto: UpdateMachineDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        model: string;
        serialNumber: string;
        installationStatus: import(".prisma/client").$Enums.MachineInstallStatus;
        notes: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        model: string;
        serialNumber: string;
        installationStatus: import(".prisma/client").$Enums.MachineInstallStatus;
        notes: string | null;
    }>;
    private ensureExists;
}
