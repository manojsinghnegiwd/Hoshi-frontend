import { WorkspaceExtension } from '@/types/workspace';
import { AgentExtension } from '@/types/agent';

export interface Extension {
  id: number;
  name: string;
  description: string;
  version: string;
  config?: Record<string, any> | null;
  workspaces: WorkspaceExtension[];
  agents: AgentExtension[];
  createdAt: Date;
  updatedAt: Date;
} 