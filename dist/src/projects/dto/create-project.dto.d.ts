import { ProjectStatus } from '@prisma/client';
export declare class CreateProjectDto {
    name: string;
    customer: string;
    location: string;
    startDate: string;
    expectedEndDate?: string;
    status?: ProjectStatus;
    pmId: string;
}
