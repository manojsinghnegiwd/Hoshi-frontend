export interface Workspace {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const workspaceService = {
  async create(data: CreateWorkspaceDto): Promise<Workspace> {
    const response = await fetch(`${API_URL}/workspace`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create workspace');
    }

    return response.json();
  },

  async getAll(): Promise<Workspace[]> {
    const response = await fetch(`${API_URL}/workspace`);

    if (!response.ok) {
      throw new Error('Failed to fetch workspaces');
    }

    return response.json();
  },

  async getById(id: number): Promise<Workspace> {
    const response = await fetch(`${API_URL}/workspace/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch workspace');
    }

    return response.json();
  },

  async update(id: number, data: UpdateWorkspaceDto): Promise<Workspace> {
    const response = await fetch(`${API_URL}/workspace/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update workspace');
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/workspace/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete workspace');
    }
  },

  async addExtension(workspaceId: number, extensionId: number, config: Record<string, any> = {}, enabled: boolean = true) {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        extensionId,
        config,
        enabled,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add extension');
    }

    return response.json();
  },

  async removeExtension(workspaceId: number, extensionId: number): Promise<void> {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/extension/${extensionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove extension');
    }
  },

  async addAgent(workspaceId: number, agentId: number, config: Record<string, any> = {}, useAllExtensions: boolean = true) {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId,
        config,
        useAllExtensions,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add agent');
    }

    return response.json();
  },

  async removeAgent(workspaceId: number, agentId: number): Promise<void> {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/agent/${agentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove agent');
    }
  },

  async getExtensions(workspaceId: number) {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/extension`);

    if (!response.ok) {
      throw new Error('Failed to fetch extensions');
    }

    return response.json();
  },

  async getAgents(workspaceId: number) {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/agent`);

    if (!response.ok) {
      throw new Error('Failed to fetch agents');
    }

    return response.json();
  },
}; 