export declare enum AttachmentTargetType {
    ISSUE = "ISSUE",
    REPORT = "REPORT",
    CHAT = "CHAT"
}
export declare class UploadAttachmentDto {
    targetType: AttachmentTargetType;
    targetId: string;
}
