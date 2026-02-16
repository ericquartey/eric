import { IssueType } from '@prisma/client';
export declare class CreateIssueDto {
    type: IssueType;
    description: string;
    projectId: string;
    machineId?: string;
    assigneeId?: string;
}
