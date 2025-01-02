'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Puzzle, Wrench, Trash2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Extension } from "@/types/extension";
import { extensionService, ExtensionTool } from "@/lib/services/extension";

const createExtensionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  version: z.string().min(1, "Version is required"),
  config: z.string().optional(),
});

export default function ExtensionsPage() {
  const { toast } = useToast();
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [tools, setTools] = useState<Record<number, ExtensionTool[]>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof createExtensionSchema>>({
    resolver: zodResolver(createExtensionSchema),
    defaultValues: {
      name: "",
      description: "",
      version: "1.0.0",
      config: "{}",
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const extensionsData = await extensionService.getAll();
      setExtensions(extensionsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load extensions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTools = async (extensionId: number) => {
    try {
      const toolsData = await extensionService.getTools(extensionId);
      setTools(prev => ({
        ...prev,
        [extensionId]: toolsData,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load extension tools",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await extensionService.delete(id);
      setExtensions(prev => prev.filter(ext => ext.id !== id));
      toast({
        title: "Success",
        description: "Extension deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete extension",
        variant: "destructive",
      });
    }
  };

  const handleTest = async (id: number) => {
    try {
      await extensionService.testExtension(id, {
        input: { test: true },
      });
      toast({
        title: "Success",
        description: "Extension test completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test extension",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof createExtensionSchema>) => {
    try {
      const newExtension = await extensionService.create({
        ...values,
        config: values.config ? JSON.parse(values.config) : {},
      });
      setExtensions(prev => [...prev, newExtension]);
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Extension created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create extension",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading extensions...</p>
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
              <h1 className="text-4xl font-bold tracking-tight">Extensions</h1>
              <p className="text-muted-foreground mt-2">
                Manage your AI agent extensions
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Extension
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Extension</DialogTitle>
                  <DialogDescription>
                    Create a new extension to enhance your AI agents.
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
                            <Input placeholder="e.g., Web Search" {...field} />
                          </FormControl>
                          <FormDescription>
                            A unique name for your extension
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
                              placeholder="Describe what this extension does..."
                              className="resize-none"
                              {...field} 
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription>
                            Explain the extension's functionality
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1.0.0" {...field} />
                          </FormControl>
                          <FormDescription>
                            Semantic version (e.g., 1.0.0)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="config"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Configuration</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="{}"
                              className="resize-none font-mono"
                              {...field} 
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription>
                            JSON configuration object
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Creating..." : "Create Extension"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {extensions.map((extension) => (
            <Card key={extension.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5 text-primary" />
                  {extension.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {extension.description}
                </CardDescription>
                <CardDescription className="text-xs">
                  Version {extension.version} • Created on {new Date(extension.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadTools(extension.id)}
                >
                  <Wrench className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest(extension.id)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(extension.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
              {tools[extension.id] && (
                <CardContent className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-2">Available Tools</h4>
                  <div className="space-y-2">
                    {tools[extension.id].map((tool) => (
                      <div key={tool.name} className="text-sm">
                        <p className="font-medium">{tool.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {tool.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
          {extensions.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No extensions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 