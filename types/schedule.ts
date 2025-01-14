export interface Schedule {
  id: number;
  agentId: number;
  type: 'INTERVAL' | 'CRON' | 'FIXED';
  interval?: number;
  cronExpression?: string;
  fixedTime?: string;
  timezone: string;
  enabled: boolean;
  metadata: any;
  lastRun?: string;
  nextRun?: string;
  status: string;
  agent: {
    id: number;
    name: string;
    description?: string;
  };
  runs: Array<{
    id: number;
    status: 'running' | 'success' | 'failed';
    startTime: string;
    endTime?: string;
    metadata?: any;
    thread?: {
      id: number;
      name: string;
      messages: Array<{
        id: number;
        role: string;
        content: string;
        createdAt: string;
      }>;
    };
  }>;
  createdAt: string;
  updatedAt: string;
} 