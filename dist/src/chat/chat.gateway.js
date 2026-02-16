"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const project_access_service_1 = require("../common/services/project-access.service");
const chat_service_1 = require("./chat.service");
const chat_ws_dto_1 = require("./dto/chat-ws.dto");
let ChatGateway = class ChatGateway {
    jwtService;
    configService;
    projectAccessService;
    chatService;
    server;
    constructor(jwtService, configService, projectAccessService, chatService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.projectAccessService = projectAccessService;
        this.chatService = chatService;
    }
    async handleConnection(client) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                throw new common_1.UnauthorizedException('Missing token');
            }
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.getOrThrow('JWT_SECRET'),
            });
            client.data.user = {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
            };
        }
        catch {
            client.disconnect(true);
        }
    }
    async onJoinProject(client, payload) {
        const user = this.requireUser(client);
        const input = await this.validateDtoOrThrow(chat_ws_dto_1.WsJoinProjectDto, payload);
        await this.projectAccessService.assertProjectAccess(user, input.projectId);
        client.join(this.getProjectRoom(input.projectId));
        client.emit('chat_joined', { projectId: input.projectId });
    }
    async onLeaveProject(client, payload) {
        const input = await this.validateDtoOrThrow(chat_ws_dto_1.WsJoinProjectDto, payload);
        client.leave(this.getProjectRoom(input.projectId));
        client.emit('chat_left', { projectId: input.projectId });
    }
    async onSendMessage(client, payload) {
        const user = this.requireUser(client);
        const input = await this.validateDtoOrThrow(chat_ws_dto_1.WsSendMessageDto, payload);
        const message = await this.chatService.create({
            projectId: input.projectId,
            message: input.message,
        }, user);
        this.server
            .to(this.getProjectRoom(input.projectId))
            .emit('chat_message_created', message);
    }
    extractToken(client) {
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
    requireUser(client) {
        if (!client.data.user) {
            throw new common_1.UnauthorizedException('Unauthorized socket client');
        }
        return client.data.user;
    }
    getProjectRoom(projectId) {
        return `project:${projectId}`;
    }
    async validateDtoOrThrow(cls, payload) {
        const input = (0, class_transformer_1.plainToInstance)(cls, payload);
        const errors = await (0, class_validator_1.validate)(input, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });
        if (errors.length > 0) {
            throw new common_1.BadRequestException('Invalid websocket payload');
        }
        return input;
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_project'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onJoinProject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_project'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onLeaveProject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onSendMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: 'chat',
        cors: {
            origin: true,
            credentials: true,
        },
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        project_access_service_1.ProjectAccessService,
        chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map