import { Agent } from '@/types/agent';
import { Extension } from '@/types/extension';

export interface Workspace {
  id: number;
  name: string;
  description?: string | null;
  userId: string;
  agents: WorkspaceAgent[];
  extensions: WorkspaceExtension[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceAgent {
  id: number;
  workspace: Workspace;
  workspaceId: number;
  agent: Agent;
  agentId: number;
  config?: Record<string, any> | null;
  useAllExtensions: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceExtension {
  id: number;
  workspace: Workspace;
  workspaceId: number;
  extension: Extension;
  extensionId: number;
  config?: Record<string, any> | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
} 