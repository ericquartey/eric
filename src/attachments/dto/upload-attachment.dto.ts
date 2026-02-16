import { IsEnum, IsString } from 'class-validator';

export enum AttachmentTargetType {
  ISSUE = 'ISSUE',
  REPORT = 'REPORT',
  CHAT = 'CHAT',
}

export class UploadAttachmentDto {
  @IsEnum(AttachmentTargetType)
  targetType!: AttachmentTargetType;

  @IsString()
  targetId!: string;
}
