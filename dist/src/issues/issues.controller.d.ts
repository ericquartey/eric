import { IssueStatus, IssueType } from '@prisma/client';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
export declare class IssuesController {
    private readonly issuesService;
    constructor(issuesService: IssuesService);
    create(dto: CreateIssueDto, user: AuthenticatedUser): Promise<{
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        status: import(".prisma/client").$Enums.IssueStatus;
        machineId: string | null;
        type: import(".prisma/client").$Enums.IssueType;
        description: string;
        assigneeId: string | null;
        createdById: string;
    }>;
    list(user: AuthenticatedUser, projectId?: string, status?: IssueStatus, type?: IssueType): Promise<({
        machine: {
            id: string;
            model: string;
            serialNumber: string;
        } | null;
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        status: import(".prisma/client").$Enums.IssueStatus;
        machineId: string | null;
        type: import(".prisma/client").$Enums.IssueType;
        description: string;
        assigneeId: string | null;
        createdById: string;
    })[]>;
    updateStatus(id: string, dto: UpdateIssueStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        status: import(".prisma/client").$Enums.IssueStatus;
        machineId: string | null;
        type: import(".prisma/client").$Enums.IssueType;
        description: string;
        assigneeId: string | null;
        createdById: string;
    }>;
}
