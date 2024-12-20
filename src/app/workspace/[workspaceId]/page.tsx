'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User2, Plus, ChevronDown, Puzzle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Workspace } from "@/types/workspace";
import { Agent } from "@/types/agent";
import { workspaceService } from "@/lib/services/workspace";
import { agentService } from "@/lib/services/agent";
import { useToast } from "@/hooks/use-toast";
import { EntityCard } from "@/components/cards/entity-card";
import { Extension } from "@/types/extension";
import { extensionService } from "@/lib/services/extension";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

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
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableExtensions, setAvailableExtensions] = useState<Extension[]>([]);
  const [addingExtension, setAddingExtension] = useState(false);
  const [extensionsOpen, setExtensionsOpen] = useState(false);

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
      const [workspaceData, workspacesData, extensionsData] = await Promise.all([
        workspaceService.getById(workspaceId),
        workspaceService.getAll(),
        extensionService.getAll(),
      ]);
      
      setWorkspace(workspaceData);
      setWorkspaces(workspacesData);
      setAgents(workspaceData.agents?.map(wa => wa.agent) || []);
      setAvailableExtensions(extensionsData);
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

  const handleAddExtension = async (extensionId: number) => {
    try {
      setAddingExtension(true);
      await workspaceService.addExtension(workspaceId, extensionId);
      await loadWorkspaceData(); // Reload to get updated workspace data
      toast({
        title: "Success",
        description: "Extension added to workspace",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add extension",
        variant: "destructive",
      });
    } finally {
      setAddingExtension(false);
    }
  };

  const handleRemoveExtension = async (extensionId: number) => {
    try {
      await workspaceService.removeExtension(workspaceId, extensionId);
      await loadWorkspaceData(); // Reload to get updated workspace data
      toast({
        title: "Success",
        description: "Extension removed from workspace",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove extension",
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setExtensionsOpen(true)}
                title="Extensions"
              >
                <Puzzle className="h-5 w-5" />
              </Button>
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
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Agents</h2>
          <div className="grid grid-cols-3 gap-6">
            {agents.map((agent) => (
              <EntityCard
                key={agent.id}
                id={agent.id}
                name={agent.name}
                description={agent.description}
                icon={User2}
                href={`/workspace/${workspaceId}/agent/${agent.id}/thread`}
                createdAt={agent.createdAt}
              />
            ))}
            {agents.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">No agents found in this workspace</p>
              </div>
            )}
          </div>
        </div>

        <Dialog open={extensionsOpen} onOpenChange={setExtensionsOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Workspace Extensions</DialogTitle>
              <DialogDescription>
                Manage extensions for this workspace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Installed Extensions</h3>
                <div className="space-y-4">
                  {workspace?.extensions?.map((ext) => (
                    <div
                      key={ext.extensionId}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Puzzle className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{ext.extension.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {ext.extension.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveExtension(ext.extensionId)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {workspace?.extensions?.length === 0 && (
                    <div className="text-center py-6 bg-muted rounded-lg">
                      <p className="text-muted-foreground">No extensions installed</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Available Extensions</h3>
                <div className="space-y-4">
                  {availableExtensions
                    .filter(ext => !workspace?.extensions?.some(we => we.extensionId === ext.id))
                    .map((ext) => (
                      <div
                        key={ext.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Puzzle className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{ext.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {ext.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddExtension(ext.id)}
                          disabled={addingExtension}
                        >
                          {addingExtension ? "Adding..." : "Add"}
                        </Button>
                      </div>
                    ))}
                  {availableExtensions.length === 0 && (
                    <div className="text-center py-6 bg-muted rounded-lg">
                      <p className="text-muted-foreground">No extensions available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 