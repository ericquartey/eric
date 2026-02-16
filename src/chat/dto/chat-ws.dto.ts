import { IsString, MaxLength, MinLength } from 'class-validator';

export class WsJoinProjectDto {
  @IsString()
  projectId!: string;
}

export class WsSendMessageDto {
  @IsString()
  projectId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message!: string;
}
