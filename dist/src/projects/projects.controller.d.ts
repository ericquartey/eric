import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(dto: CreateProjectDto): import(".prisma/client").Prisma.Prisma__ProjectClient<{
        pm: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        startDate: Date;
        customer: string;
        location: string;
        expectedEndDate: Date | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        pmId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            assignments: number;
            machines: number;
            issues: number;
        };
        pm: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        startDate: Date;
        customer: string;
        location: string;
        expectedEndDate: Date | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        pmId: string;
    })[]>;
    findOne(id: string): Promise<{
        assignments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            installerId: string;
            startDate: Date;
            endDate: Date | null;
        }[];
        pm: {
            id: string;
            firstName: string;
            lastName: string;
        };
        machines: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            model: string;
            serialNumber: string;
            installationStatus: import(".prisma/client").$Enums.MachineInstallStatus;
            notes: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        startDate: Date;
        customer: string;
        location: string;
        expectedEndDate: Date | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        pmId: string;
    }>;
    update(id: string, dto: UpdateProjectDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        startDate: Date;
        customer: string;
        location: string;
        expectedEndDate: Date | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        pmId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        startDate: Date;
        customer: string;
        location: string;
        expectedEndDate: Date | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        pmId: string;
    }>;
}
