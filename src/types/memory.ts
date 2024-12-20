import { Agent } from '@/types/agent';

export interface Memory {
  id: number;
  agent: Agent;
  agentId: number;
  key: string;
  value: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
} 