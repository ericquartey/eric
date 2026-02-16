import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
export declare class AssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    create(dto: CreateAssignmentDto): import(".prisma/client").Prisma.Prisma__AssignmentClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        installerId: string;
        startDate: Date;
        endDate: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    list(user: AuthenticatedUser, projectId?: string, installerId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        project: {
            id: string;
            name: string;
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
        startDate: Date;
        endDate: Date | null;
    })[]>;
}
