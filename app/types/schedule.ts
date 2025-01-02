import { Agent } from '@/types/agent';

export interface Schedule {
  id: number;
  agent: Agent;
  agentId: number;
  type: string;  // "interval", "cron", "fixed"
  interval?: number | null;
  cronExpression?: string | null;
  fixedTime?: Date | null;
  timezone: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
} 