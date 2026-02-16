export interface ChatClientEvents {
  join_project: (payload: { projectId: string }) => void;
  leave_project: (payload: { projectId: string }) => void;
  send_message: (payload: { projectId: string; message: string }) => void;
}

export interface ChatServerEvents {
  chat_joined: (payload: { projectId: string }) => void;
  chat_left: (payload: { projectId: string }) => void;
  chat_message_created: (payload: unknown) => void;
  chat_error: (payload: { message: string }) => void;
}
