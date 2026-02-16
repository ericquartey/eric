import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  create(@Body() dto: CreateChatMessageDto, @CurrentUser() user: AuthenticatedUser) {
    return this.chatService.create(dto, user);
  }

  @Get('messages')
  list(@CurrentUser() user: AuthenticatedUser, @Query('projectId') projectId?: string) {
    if (!projectId) {
      throw new BadRequestException('projectId is required');
    }

    return this.chatService.list(user, projectId);
  }
}
