'use client';

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Folder, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { workspaceService } from "@/lib/services/workspace";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Workspace } from "@/types";
import { useSupabase } from "@/providers/supabase-provider";

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  userId: z.string(),
});

export default function WorkspacesPage() {
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useSupabase();

  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      userId: user?.id || "",
    },
  });

  useEffect(() => {
    if (user?.id) {
      form.setValue('userId', user.id);
    }
  }, [user, form]);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const data = await workspaceService.getAll();
      setWorkspaces(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load workspaces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof createWorkspaceSchema>) => {
    try {
      const newWorkspace = await workspaceService.create(values);
      setWorkspaces(prev => [...prev, newWorkspace]);
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Workspace created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workspace",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto p-6">
        <div className="flex flex-col gap-6 mb-8 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Workspaces</h1>
              <p className="text-muted-foreground mt-2">Select a workspace to manage your AI agents</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Workspace
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Workspace</DialogTitle>
                  <DialogDescription>
                    Create a new workspace to organize your AI agents.
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
                            <Input placeholder="e.g., Development" {...field} />
                          </FormControl>
                          <FormDescription>
                            Give your workspace a descriptive name
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
                              placeholder="Describe the purpose of this workspace..."
                              className="resize-none"
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional description for your workspace
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Creating..." : "Create Workspace"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Link href={`/workspace/${workspace.id}`} key={workspace.id} className="block">
              <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    {workspace.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {workspace.description || 'No description'}
                  </CardDescription>
                  <CardDescription className="text-xs">
                    Created on {new Date(workspace.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
          {workspaces.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No workspaces found. Create your first workspace to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 