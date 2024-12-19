export interface Agent {
  id: number;
  name: string;
  description: string;
  workspaceId: number;
  createdAt: Date;
}

export interface CreateAgentDto {
  name: string;
  description: string;
  workspaceId: number;
}

export interface UpdateAgentDto {
  name?: string;
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const agentService = {
  async create(data: CreateAgentDto): Promise<Agent> {
    const response = await fetch(`${API_URL}/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create agent');
    }

    return response.json();
  },

  async getAll(): Promise<Agent[]> {
    const response = await fetch(`${API_URL}/agent`);

    if (!response.ok) {
      throw new Error('Failed to fetch agents');
    }

    return response.json();
  },

  async getById(id: number): Promise<Agent> {
    const response = await fetch(`${API_URL}/agent/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch agent');
    }

    return response.json();
  },

  async update(id: number, data: UpdateAgentDto): Promise<Agent> {
    const response = await fetch(`${API_URL}/agent/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update agent');
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/agent/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete agent');
    }
  },
}; 