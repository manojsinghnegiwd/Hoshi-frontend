'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Plus, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Workspace, workspaceService } from "@/lib/services/workspace";
import { useToast } from "@/hooks/use-toast";
import { Agent, agentService } from "@/lib/services/agent";

const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
});

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const workspaceId = Number(params.workspaceId);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [open, setOpen] = useState(false);
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof createAgentSchema>>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    loadWorkspaceData();
  }, [workspaceId]);

  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      const [workspaceData, workspacesData] = await Promise.all([
        workspaceService.getById(workspaceId),
        workspaceService.getAll(),
      ]);
      
      setWorkspace(workspaceData);
      setWorkspaces(workspacesData);

      try {
        const agentsData = await agentService.getAll();
        setAgents(agentsData.filter(agent => agent.workspaceId === workspaceId));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load agents",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load workspace data",
        variant: "destructive",
      });
      if (!workspace) {
        router.push('/workspace');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof createAgentSchema>) => {
    try {
      const newAgent = await agentService.create({
        ...values,
        workspaceId,
      });
      setAgents(prev => [...prev, newAgent]);
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Agent created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create agent",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Workspace not found</p>
          <Button 
            variant="link" 
            onClick={() => router.push('/workspace')}
            className="mt-4"
          >
            Go back to workspaces
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] p-6">
        <div className="flex flex-col gap-6 mb-8 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold tracking-tight">
                  {workspace.name}
                </h1>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      Switch
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {workspaces.map((w) => (
                      <DropdownMenuItem
                        key={w.id}
                        className={cn(
                          "cursor-pointer",
                          w.id === workspaceId && "bg-muted"
                        )}
                        onClick={() => {
                          router.push(`/workspace/${w.id}`);
                        }}
                      >
                        {w.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push('/workspace')}
                      className="cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Manage Workspaces
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {workspace.description && (
                <p className="text-muted-foreground mt-2">{workspace.description}</p>
              )}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Agent</DialogTitle>
                  <DialogDescription>
                    Create a new AI agent to help you with specific tasks.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Code Assistant" {...field} />
                          </FormControl>
                          <FormDescription>
                            Give your agent a descriptive name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what this agent does and its capabilities..."
                              className="resize-none"
                              {...field} 
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription>
                            Describe what this agent does (max 500 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Creating..." : "Create Agent"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Link href={`/workspace/${workspaceId}/agent/${agent.id}/thread/new`} key={agent.id} className="block">
              <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    {agent.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {agent.description}
                  </CardDescription>
                  <CardDescription className="text-xs">
                    Created on {new Date(agent.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
          {agents.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No agents found in this workspace</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 