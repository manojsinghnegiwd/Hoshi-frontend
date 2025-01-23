import { Workspace } from '@/types/workspace';
import { supabase } from '@/lib/supabase';

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  userId: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper function to get auth token
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
  };
};

export const workspaceService = {
  async create(data: CreateWorkspaceDto): Promise<Workspace> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/workspace`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create workspace');
    }

    return response.json();
  },

  async getAll(): Promise<Workspace[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/workspace`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workspaces');
    }

    return response.json();
  },

  async getById(id: number): Promise<Workspace> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/workspace/${id}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workspace');
    }

    return response.json();
  },

  async update(id: number, data: UpdateWorkspaceDto): Promise<Workspace> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/workspace/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update workspace');
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/workspace/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to delete workspace');
    }
  },

  async addExtension(workspaceId: number, extensionId: number, config: Record<string, any> = {}, enabled: boolean = true) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/extension`, {
      method: 'POST',
      headers,
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
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/extension/${extensionId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to remove extension');
    }
  },

  async addAgent(workspaceId: number, agentId: number, config: Record<string, any> = {}, useAllExtensions: boolean = true) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/agent`, {
      method: 'POST',
      headers,
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
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/agent/${agentId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to remove agent');
    }
  },

  async getExtensions(workspaceId: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/extension`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch extensions');
    }

    return response.json();
  },

  async getAgents(workspaceId: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/agent`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch agents');
    }

    return response.json();
  },
}; 