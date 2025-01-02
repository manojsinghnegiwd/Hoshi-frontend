import { Extension } from '@/types/extension';
import { Thread } from '@/types/thread';
import { Memory } from '@/types/memory';
import { Schedule } from '@/types/schedule';
import { WorkspaceAgent } from '@/types/workspace';

export interface Agent {
  id: number;
  name: string;
  description?: string | null;
  status: string;  // idle, running, completed, failed
  schedule?: Schedule | null;
  lastRun?: Date | null;
  nextRun?: Date | null;
  workspaces: WorkspaceAgent[];
  extensions: AgentExtension[];
  threads: Thread[];
  memories: Memory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentExtension {
  id: number;
  agent: Agent;
  agentId: number;
  extension: Extension;
  extensionId: number;
  config?: Record<string, any> | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
} 