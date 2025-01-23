'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { schedulerService, type ScheduleRun } from '@/lib/services/scheduler';
import type { Schedule } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowLeft, Play, Pause, History, MessageSquare, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ThreadMessage {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

export default function SchedulerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [runs, setRuns] = useState<ScheduleRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ScheduleRun | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduleAndRuns();
  }, [params.id]);

  const loadScheduleAndRuns = async () => {
    try {
      const [scheduleData, runsData] = await Promise.all([
        schedulerService.getById(Number(params.id)),
        schedulerService.getRuns(Number(params.id))
      ]);
      setSchedule(scheduleData);
      setRuns(runsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load task details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = async () => {
    if (!schedule) return;
    
    try {
      if (schedule.status === 'paused') {
        await schedulerService.resume(schedule.id);
        toast({ title: "Success", description: "Task resumed" });
      } else {
        await schedulerService.pause(schedule.id);
        toast({ title: "Success", description: "Task paused" });
      }
      loadScheduleAndRuns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const getNextRunInfo = () => {
    if (!schedule) return 'Not scheduled';
    
    if (schedule.type === 'FIXED') {
      return new Date(schedule.fixedTime!).toLocaleString();
    }
    
    if (schedule.nextRun) {
      const nextRun = new Date(schedule.nextRun);
      const timeUntil = nextRun.getTime() - Date.now();
      const minutes = Math.floor(timeUntil / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${nextRun.toLocaleString()} (in ${days} days)`;
      }
      if (hours > 0) {
        return `${nextRun.toLocaleString()} (in ${hours}h ${minutes % 60}m)`;
      }
      return `${nextRun.toLocaleString()} (in ${minutes}m)`;
    }
    
    return 'Not scheduled';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Task not found</p>
        </div>
      </div>
    );
  }

  const successfulRuns = runs.filter(run => run.status === 'success').length;
  const failedRuns = runs.filter(run => run.status === 'failed').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/scheduler')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Task Details</h1>
            <p className="text-muted-foreground mt-2">View and manage your task schedule and execution history</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePauseResume}
                  className="gap-2"
                >
                  {schedule.status === 'paused' ? (
                    <>
                      <Play className="h-4 w-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  )}
                </Button>
              </div>
              <Badge
                variant={schedule.status === 'active' ? 'default' : 'secondary'}
                className="mt-2"
              >
                {schedule.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Task Input</h3>
                <p className="text-sm text-muted-foreground">
                  {schedule.metadata.input}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Next Run</p>
                  <p className="font-medium">
                    {getNextRunInfo()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Run</p>
                  <p className="font-medium">
                    {schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Runs</p>
                  <p className="font-medium">{runs.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Successful</p>
                  <p className="font-medium text-green-600">{successfulRuns}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Failed</p>
                  <p className="font-medium text-red-600">{failedRuns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Execution History</CardTitle>
                  <CardDescription>View the history of task executions and their results</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={loadScheduleAndRuns}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Thread</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((run) => (
                    <TableRow key={run.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        {new Date(run.startTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {run.endTime ? new Date(run.endTime).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            run.status === 'success'
                              ? 'default'
                              : run.status === 'running'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {run.thread ? run.thread.name : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRun(run)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {runs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No execution history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedRun && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Execution Details</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRun(null)}
                  >
                    Close
                  </Button>
                </CardTitle>
                <CardDescription>
                  Run started at {new Date(selectedRun.startTime).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="thread">
                  <TabsList>
                    <TabsTrigger value="thread" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Thread
                    </TabsTrigger>
                    <TabsTrigger value="details" className="gap-2">
                      <History className="h-4 w-4" />
                      Details
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="thread">
                    <div className="space-y-4">
                      {selectedRun.thread?.messages.map((message: ThreadMessage) => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-lg ${
                            message.role === 'assistant'
                              ? 'bg-primary/10'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm font-medium mb-1">
                            {message.role === 'assistant' ? 'Assistant' : 'System'}
                          </p>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ))}
                      {!selectedRun.thread && (
                        <p className="text-center text-muted-foreground">
                          No thread messages found
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Status</h4>
                        <Badge
                          variant={
                            selectedRun.status === 'success'
                              ? 'default'
                              : selectedRun.status === 'running'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {selectedRun.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Duration</h4>
                        <p className="text-sm">
                          {selectedRun.endTime
                            ? `${Math.round(
                                (new Date(selectedRun.endTime).getTime() -
                                  new Date(selectedRun.startTime).getTime()) /
                                  1000
                              )} seconds`
                            : 'Running...'}
                        </p>
                      </div>
                      {selectedRun.metadata && (
                        <div>
                          <h4 className="font-medium mb-2">Metadata</h4>
                          <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                            {JSON.stringify(selectedRun.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 