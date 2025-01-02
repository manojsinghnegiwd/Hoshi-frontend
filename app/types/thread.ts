import { Agent } from '@/types/agent';
import { Message } from '@/types/message';

export interface Thread {
  id: number;
  agent: Agent;
  agentId: number;
  name: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
} 