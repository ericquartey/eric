import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ProjectAccessService } from '../common/services/project-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
export declare class ChatService {
    private readonly prisma;
    private readonly projectAccessService;
    constructor(prisma: PrismaService, projectAccessService: ProjectAccessService);
    create(dto: CreateChatMessageDto, user: AuthenticatedUser): Promise<{
        sender: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        projectId: string;
        message: string;
        senderId: string;
    }>;
    list(user: AuthenticatedUser, projectId: string): Promise<({
        sender: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        projectId: string;
        message: string;
        senderId: string;
    })[]>;
}
