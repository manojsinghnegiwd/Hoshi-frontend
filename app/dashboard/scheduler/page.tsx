'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { workspaceService } from '@/lib/services/workspace';
import { schedulerService } from '@/lib/services/scheduler';
import { useToast } from "@/hooks/use-toast";
import type { Workspace, WorkspaceAgent } from '@/types/workspace';
import type { Schedule } from '@/types/schedule';
import { Calendar, Clock, Plus, Pause, Play, Trash2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { useSupabase } from '@/providers/supabase-provider';

const scheduleFormSchema = z.object({
  workspaceId: z.string(),
  agentId: z.string(),
  type: z.enum(['INTERVAL', 'CRON', 'FIXED']),
  interval: z.number().optional(),
  cronExpression: z.string().optional(),
  timezone: z.string().optional(),
  fixedTime: z.string().optional(),
  metadata: z.object({
    input: z.string(),
  }),
  userId: z.string(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export default function SchedulerPage() {
  const [open, setOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleType, setScheduleType] = useState<'INTERVAL' | 'CRON' | 'FIXED'>('INTERVAL');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [agents, setAgents] = useState<WorkspaceAgent[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const { toast } = useToast();
  const { user } = useSupabase();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      workspaceId: '',
      agentId: '',
      type: 'INTERVAL',
      metadata: {
        input: '',
      },
      userId: user?.id || '',
    },
  });

  useEffect(() => {
    if (user?.id) {
      form.setValue('userId', user.id);
    }
  }, [user, form]);

  useEffect(() => {
    loadSchedules();
    loadWorkspaces();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await schedulerService.getAll();
      setSchedules(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      setIsLoadingWorkspaces(false);
    }
  };

  const fetchAgentsForWorkspace = async (workspaceId: string) => {
    setIsLoadingAgents(true);
    try {
      const data = await workspaceService.getAgents(parseInt(workspaceId));
      setAgents(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch agents",
        variant: "destructive",
      });
      setAgents([]);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    form.setValue('workspaceId', workspaceId);
    form.setValue('agentId', ''); // Reset agent selection
    fetchAgentsForWorkspace(workspaceId);
  };

  const handlePauseResume = async (id: number, currentStatus: string) => {
    try {
      if (currentStatus === 'paused') {
        await schedulerService.resume(id);
        toast({ title: "Success", description: "Task resumed" });
      } else {
        await schedulerService.pause(id);
        toast({ title: "Success", description: "Task paused" });
      }
      loadSchedules(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await schedulerService.delete(id);
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      toast({ title: "Success", description: "Task deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ScheduleFormValues) => {
    try {
      const { workspaceId, ...scheduleData } = data;
      await schedulerService.create({
        ...scheduleData,
        agentId: parseInt(data.agentId),
        userId: user?.id || '',
      });
      loadSchedules();
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading tasks...</p>
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
              <h1 className="text-4xl font-bold tracking-tight">Tasks</h1>
              <p className="text-muted-foreground mt-2">Manage your automated tasks and schedules</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Create a new task and set up its schedule to automate your agent.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="workspaceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workspace</FormLabel>
                          <Select
                            disabled={isLoadingWorkspaces}
                            onValueChange={handleWorkspaceChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a workspace" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workspaces.map((workspace) => (
                                <SelectItem key={workspace.id} value={workspace.id.toString()}>
                                  {workspace.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="agentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agent</FormLabel>
                          <Select
                            disabled={isLoadingAgents || !form.getValues('workspaceId')}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={form.getValues('workspaceId') ? "Select an agent" : "Select a workspace first"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {agents.map((workspaceAgent) => (
                                <SelectItem key={workspaceAgent.agent.id} value={workspaceAgent.agent.id.toString()}>
                                  {workspaceAgent.agent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule Type</FormLabel>
                          <Select
                            onValueChange={(value: 'INTERVAL' | 'CRON' | 'FIXED') => {
                              field.onChange(value);
                              setScheduleType(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select schedule type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INTERVAL">Interval</SelectItem>
                              <SelectItem value="CRON">Cron</SelectItem>
                              <SelectItem value="FIXED">Fixed Time</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {scheduleType === 'INTERVAL' && (
                      <FormField
                        control={form.control}
                        name="interval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interval (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {scheduleType === 'CRON' && (
                      <>
                        <FormField
                          control={form.control}
                          name="cronExpression"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cron Expression</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="0 9 * * *" />
                              </FormControl>
                              <FormDescription>
                                Use cron syntax (e.g., "0 9 * * *" for daily at 9 AM)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timezone</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="America/Los_Angeles" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {scheduleType === 'FIXED' && (
                      <FormField
                        control={form.control}
                        name="fixedTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fixed Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="metadata.input"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Input</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter the task input..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Creating..." : "Create Schedule"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {schedule.type === 'INTERVAL' && <Clock className="h-5 w-5 text-primary" />}
                      {schedule.type === 'CRON' && <Calendar className="h-5 w-5 text-primary" />}
                      {schedule.type === 'FIXED' && <Calendar className="h-5 w-5 text-primary" />}
                      {schedule.agent.name}
                    </CardTitle>
                    <CardDescription>
                      {schedule.type === 'INTERVAL' && `Every ${schedule.interval} minutes`}
                      {schedule.type === 'CRON' && schedule.cronExpression}
                      {schedule.type === 'FIXED' && new Date(schedule.fixedTime!).toLocaleString()}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/scheduler/${schedule.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePauseResume(schedule.id, schedule.status)}>
                        {schedule.status === 'paused' ? (
                          <Play className="h-4 w-4 mr-2" />
                        ) : (
                          <Pause className="h-4 w-4 mr-2" />
                        )}
                        {schedule.status === 'paused' ? 'Resume' : 'Pause'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Badge
                  variant={schedule.status === 'active' ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {schedule.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {schedule.metadata.input}
                </p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground mt-auto">
                <div className="space-y-1">
                  <p>Next run: {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'Not scheduled'}</p>
                  <p>Last run: {schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Never'}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
          {schedules.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No tasks found. Create your first task to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 