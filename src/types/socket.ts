export interface ServerToClientEvents {
  'thread:message': (message: ThreadMessage) => void;
  'thread:status': (status: ThreadStatus) => void;
  'error': (error: string) => void;
}

export interface ClientToServerEvents {
  'thread:create': (data: CreateThreadData, callback: (response: ThreadResponse) => void) => void;
  'thread:join': (threadId: number) => void;
  'thread:leave': (threadId: number) => void;
  'thread:message:send': (data: SendMessageData, callback: (response: MessageResponse) => void) => void;
}

export interface ThreadMessage {
  id: number;
  threadId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface ThreadStatus {
  threadId: number;
  status: 'typing' | 'idle';
}

export interface CreateThreadData {
  agentId: number;
  name?: string;
  initialMessage?: string;
}

export interface ThreadResponse {
  success: boolean;
  thread?: {
    id: number;
    name: string;
    messages: ThreadMessage[];
  };
  error?: string;
}

export interface SendMessageData {
  threadId: number;
  content: string;
}

export interface MessageResponse {
  success: boolean;
  message?: ThreadMessage;
  error?: string;
} 