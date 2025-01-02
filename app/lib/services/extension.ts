import { Extension } from '@/types/extension';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateExtensionDto {
  name: string;
  description: string;
  version: string;
  config?: Record<string, any>;
}

export interface UpdateExtensionDto {
  name?: string;
  description?: string;
  version?: string;
  config?: Record<string, any>;
}

export interface ExtensionTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface TestExtensionDto {
  input: Record<string, any>;
}

export interface AvailableExtension {
  name: string;
  description: string;
  version: string;
}

export const extensionService = {
  async create(data: CreateExtensionDto): Promise<Extension> {
    const response = await fetch(`${API_URL}/extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create extension');
    }

    return response.json();
  },

  async getAll(): Promise<Extension[]> {
    const response = await fetch(`${API_URL}/extension`);

    if (!response.ok) {
      throw new Error('Failed to fetch extensions');
    }

    return response.json();
  },

  async getById(id: number): Promise<Extension> {
    const response = await fetch(`${API_URL}/extension/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch extension');
    }

    return response.json();
  },

  async update(id: number, data: UpdateExtensionDto): Promise<Extension> {
    const response = await fetch(`${API_URL}/extension/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update extension');
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/extension/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete extension');
    }
  },

  async getTools(id: number): Promise<ExtensionTool[]> {
    const response = await fetch(`${API_URL}/extension/${id}/tools`);

    if (!response.ok) {
      throw new Error('Failed to fetch extension tools');
    }

    return response.json();
  },

  async getAvailableExtensions(): Promise<AvailableExtension[]> {
    const response = await fetch(`${API_URL}/extension/available/list`);

    if (!response.ok) {
      throw new Error('Failed to fetch available extensions');
    }

    return response.json();
  },

  async testExtension(id: number, data: TestExtensionDto): Promise<any> {
    const response = await fetch(`${API_URL}/extension/${id}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to test extension');
    }

    return response.json();
  },
}; 