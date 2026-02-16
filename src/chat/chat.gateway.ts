import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ProjectAccessService } from '../common/services/project-access.service';
import { ChatService } from './chat.service';
import { WsJoinProjectDto, WsSendMessageDto } from './dto/chat-ws.dto';
import type { ChatClientEvents, ChatServerEvents } from './interfaces/chat-events.interface';

type ChatSocket = Socket<
  ChatClientEvents,
  ChatServerEvents,
  Record<string, never>,
  { user?: AuthenticatedUser }
>;

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: true,
    credentials: true,
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server<ChatClientEvents, ChatServerEvents>;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: ChatSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: 'ADMIN' | 'PM' | 'INSTALLER';
      }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      client.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('join_project')
  async onJoinProject(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    const user = this.requireUser(client);
    const input = await this.validateDtoOrThrow(WsJoinProjectDto, payload);
    await this.projectAccessService.assertProjectAccess(user, input.projectId);

    client.join(this.getProjectRoom(input.projectId));
    client.emit('chat_joined', { projectId: input.projectId });
  }

  @SubscribeMessage('leave_project')
  async onLeaveProject(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    const input = await this.validateDtoOrThrow(WsJoinProjectDto, payload);
    client.leave(this.getProjectRoom(input.projectId));
    client.emit('chat_left', { projectId: input.projectId });
  }

  @SubscribeMessage('send_message')
  async onSendMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    const user = this.requireUser(client);
    const input = await this.validateDtoOrThrow(WsSendMessageDto, payload);

    const message = await this.chatService.create(
      {
        projectId: input.projectId,
        message: input.message,
      },
      user,
    );

    this.server
      .to(this.getProjectRoom(input.projectId))
      .emit('chat_message_created', message);
  }

  private extractToken(client: ChatSocket): string | undefined {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const authHeader = client.handshake.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice('Bearer '.length);
    }

    return undefined;
  }

  private requireUser(client: ChatSocket): AuthenticatedUser {
    if (!client.data.user) {
      throw new UnauthorizedException('Unauthorized socket client');
    }

    return client.data.user;
  }

  private getProjectRoom(projectId: string): string {
    return `project:${projectId}`;
  }

  private async validateDtoOrThrow<T extends object>(
    cls: new () => T,
    payload: unknown,
  ): Promise<T> {
    const input = plainToInstance(cls, payload);
    const errors = await validate(input as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException('Invalid websocket payload');
    }

    return input;
  }
}
