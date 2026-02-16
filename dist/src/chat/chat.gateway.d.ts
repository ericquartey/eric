import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ProjectAccessService } from '../common/services/project-access.service';
import { ChatService } from './chat.service';
import type { ChatClientEvents, ChatServerEvents } from './interfaces/chat-events.interface';
type ChatSocket = Socket<ChatClientEvents, ChatServerEvents, Record<string, never>, {
    user?: AuthenticatedUser;
}>;
export declare class ChatGateway implements OnGatewayConnection {
    private readonly jwtService;
    private readonly configService;
    private readonly projectAccessService;
    private readonly chatService;
    server: Server<ChatClientEvents, ChatServerEvents>;
    constructor(jwtService: JwtService, configService: ConfigService, projectAccessService: ProjectAccessService, chatService: ChatService);
    handleConnection(client: ChatSocket): Promise<void>;
    onJoinProject(client: ChatSocket, payload: unknown): Promise<void>;
    onLeaveProject(client: ChatSocket, payload: unknown): Promise<void>;
    onSendMessage(client: ChatSocket, payload: unknown): Promise<void>;
    private extractToken;
    private requireUser;
    private getProjectRoom;
    private validateDtoOrThrow;
}
export {};
