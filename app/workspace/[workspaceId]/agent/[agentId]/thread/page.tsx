'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Thread } from "@/types/thread";
import { useToast } from "@/hooks/use-toast";
import { threadService } from "@/lib/services/thread";

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const workspaceId = Number(params.workspaceId);
  const agentId = Number(params.agentId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupThread = async () => {
      try {
        // 1. First, try to fetch existing threads for this agent
        const threads = await threadService.getAgentThreads(agentId);

        if (threads.length > 0) {
          // If threads exist, redirect to the latest one
          const latestThread = threads[0]; // Assuming threads are sorted by date
          router.replace(`/workspace/${workspaceId}/agent/${agentId}/thread/${latestThread.id}`);
        } else {
          // If no threads exist, create a new one
          const newThread = await threadService.createForAgent(agentId);
          
          router.replace(`/workspace/${workspaceId}/agent/${agentId}/thread/${newThread.id}`);
        }
      } catch (error) {
        console.error('Error setting up thread:', error);
        toast({
          title: "Error",
          description: "Failed to setup thread",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    setupThread();
  }, [workspaceId, agentId, router, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Setting up your chat...</p>
        </div>
      </div>
    );
  }

  return null; // This page should always redirect
}
