'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { schedulerService, type ScheduleLog } from '@/lib/services/scheduler';
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
import { Calendar, Clock, ArrowLeft, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SchedulerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [logs, setLogs] = useState<ScheduleLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduleAndLogs();
  }, [params.id]);

  const loadScheduleAndLogs = async () => {
    try {
      const [scheduleData, logsData] = await Promise.all([
        schedulerService.getById(Number(params.id)),
        schedulerService.getLogs(Number(params.id))
      ]);
      setSchedule(scheduleData);
      setLogs(logsData);
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
      loadScheduleAndLogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
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
                    {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'Not scheduled'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Run</p>
                  <p className="font-medium">
                    {schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>View the history of task executions and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.startTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {log.endTime ? new Date(log.endTime).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === 'success'
                              ? 'default'
                              : log.status === 'running'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-destructive">
                        {log.error || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No execution history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 