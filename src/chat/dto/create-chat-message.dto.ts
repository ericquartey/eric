import { IsString } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  projectId!: string;

  @IsString()
  message!: string;
}
