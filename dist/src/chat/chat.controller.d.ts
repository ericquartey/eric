import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
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
    list(user: AuthenticatedUser, projectId?: string): Promise<({
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
