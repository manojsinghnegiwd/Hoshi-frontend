import { Thread } from '@/types/thread';
import { Message } from '@/types/message';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SendMessageDto {
  content: string;
}

export const threadService = {
  async createForAgent(agentId: number): Promise<Thread> {
    const response = await fetch(`${API_URL}/thread/agent/${agentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agentId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create thread');
    }

    return response.json();
  },

  async getAgentThreads(agentId: number): Promise<Thread[]> {
    const response = await fetch(`${API_URL}/thread/agent/${agentId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch agent threads');
    }

    return response.json();
  },

  async getById(threadId: number): Promise<Thread> {
    const response = await fetch(`${API_URL}/thread/${threadId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch thread');
    }

    return response.json();
  },

  async sendMessage(threadId: number, data: SendMessageDto): Promise<Message> {
    const response = await fetch(`${API_URL}/thread/${threadId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  async delete(threadId: number): Promise<void> {
    const response = await fetch(`${API_URL}/thread/${threadId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete thread');
    }
  },
}; 