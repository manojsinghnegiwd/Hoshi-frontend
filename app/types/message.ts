import { Thread } from '@/types/thread';

export interface Message {
  id: number;
  thread: Thread;
  threadId: number;
  role: string;  // system, user, assistant
  content: string;
  createdAt: Date;
} 