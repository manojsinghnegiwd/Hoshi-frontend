import { Schedule } from '@/types/schedule';

export interface ScheduleRun {
  id: number;
  scheduleId: number;
  threadId: number | null;
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
}

export interface CreateScheduleDto {
  agentId: number;
  type: 'INTERVAL' | 'CRON' | 'FIXED';
  interval?: number;
  cronExpression?: string;
  timezone?: string;
  fixedTime?: string;
  metadata?: any;
  userId: string;
}

class SchedulerService {
  private baseUrl = 'http://localhost:3000/scheduler';

  private async getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
    };
  }

  async create(data: CreateScheduleDto): Promise<Schedule> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create schedule');
    }

    return response.json();
  }

  async getAll(): Promise<Schedule[]> {
    const response = await fetch(this.baseUrl, {
      headers: await this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch schedules');
    }
    return response.json();
  }

  async getById(id: number): Promise<Schedule> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: await this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch schedule');
    }
    return response.json();
  }

  async pause(id: number): Promise<Schedule> {
    const response = await fetch(`${this.baseUrl}/${id}/pause`, {
      method: 'POST',
      headers: await this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to pause schedule');
    }
    return response.json();
  }

  async resume(id: number): Promise<Schedule> {
    const response = await fetch(`${this.baseUrl}/${id}/resume`, {
      method: 'POST',
      headers: await this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to resume schedule');
    }
    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: await this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to delete schedule');
    }
  }

  async getRuns(id: number): Promise<ScheduleRun[]> {
    const response = await fetch(`${this.baseUrl}/${id}/runs`, {
      headers: await this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch schedule runs');
    }
    return response.json();
  }
}

export const schedulerService = new SchedulerService(); 