import { Agent } from './agent';

export interface Schedule {
  id: number;
  type: 'INTERVAL' | 'CRON' | 'FIXED';
  interval?: number;
  cronExpression?: string;
  timezone?: string;
  fixedTime?: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  metadata: {
    input: string;
  };
  agent: Agent;
  lastRun?: Date | null;
  nextRun?: Date | null;
  createdAt: Date;
  updatedAt: Date;
} 