import type { Schedule } from '@/types/schedule';

export interface ScheduleLog {
  id: number;
  scheduleId: number;
  status: string;
  error?: string;
  metadata?: any;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
}

export interface CreateScheduleDto {
  agentId: number;
  type: 'INTERVAL' | 'CRON' | 'FIXED';
  interval?: number;
  cronExpression?: string;
  timezone?: string;
  fixedTime?: string;
  metadata: {
    input: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const schedulerService = {
  async create(data: CreateScheduleDto): Promise<Schedule> {
    const response = await fetch(`${API_URL}/scheduler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create schedule');
    }

    return response.json();
  },

  async getAll(): Promise<Schedule[]> {
    const response = await fetch(`${API_URL}/scheduler`);

    if (!response.ok) {
      throw new Error('Failed to fetch schedules');
    }

    return response.json();
  },

  async getById(id: number): Promise<Schedule> {
    const response = await fetch(`${API_URL}/scheduler/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch schedule');
    }

    return response.json();
  },

  async pause(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/scheduler/${id}/pause`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to pause schedule');
    }
  },

  async resume(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/scheduler/${id}/resume`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to resume schedule');
    }
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/scheduler/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete schedule');
    }
  },

  async getLogs(id: number): Promise<ScheduleLog[]> {
    const response = await fetch(`${API_URL}/scheduler/${id}/logs`);

    if (!response.ok) {
      throw new Error('Failed to fetch schedule logs');
    }

    return response.json();
  },
}; 