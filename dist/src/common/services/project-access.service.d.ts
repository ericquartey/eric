import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
export declare class ProjectAccessService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    assertProjectAccess(user: AuthenticatedUser, projectId: string): Promise<void>;
    getProjectFilter(user: AuthenticatedUser, projectId?: string): Promise<{
        projectId?: string | {
            in: string[];
        };
    }>;
}
