'use client';

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Thread } from "@/types/thread";
import { useToast } from "@/hooks/use-toast";
import { threadService } from "@/lib/services/thread";
import { Button } from "@/components/ui/button";
import { AutoExpandingTextarea } from "@/components/ui/auto-expanding-textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Trash2, Loader2, Wrench } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ClientToServerEvents, ServerToClientEvents, ThreadStatus, ThreadMessage, StreamChunk, ToolExecution } from "@/types/socket";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface StreamingMessage {
  messageId: number;
  threadId: number;
  content: string;
  done: boolean;
}

type ToolExecutionsMap = Record<number, ToolExecution[]>;

function MessageToolExecution({ messageId, toolExecutions }: { messageId: number, toolExecutions: ToolExecutionsMap }) {
  const messageTools = toolExecutions[messageId] || [];
  if (messageTools.length === 0) return null;

  return (
    <Accordion type="single" collapsible defaultValue="tool" className="mb-2">
      <AccordionItem value="tool" className="border-0">
        <AccordionTrigger className="py-1 hover:no-underline">
          <div className="flex items-center text-xs text-muted-foreground">
            <Wrench className="h-3 w-3 mr-1" />
            <span>View tool executions ({messageTools.length})</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {messageTools.map((tool, index) => (
              <div key={index} className="text-xs text-muted-foreground pl-4 border-l-2 border-muted">
                {tool.explanation}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const workspaceId = Number(params.workspaceId);
  const agentId = Number(params.agentId);
  const threadId = Number(params.threadId);
  
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<ThreadStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingMessages, setStreamingMessages] = useState<Record<number, StreamingMessage>>({});
  const [deletingThreads, setDeletingThreads] = useState<Set<number>>(new Set());
  const [toolExecutions, setToolExecutions] = useState<ToolExecutionsMap>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessages]);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
    setSocket(socketInstance);

    socketInstance.on('thread:message', (message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socketInstance.on('thread:message:stream', (data: StreamChunk) => {
      setStreamingMessages(prev => ({
        ...prev,
        [data.messageId]: {
          messageId: data.messageId,
          threadId: data.threadId,
          content: prev[data.messageId]?.content 
            ? prev[data.messageId].content + data.chunk 
            : data.chunk,
          done: data.done,
        }
      }));
    });

    socketInstance.on('thread:message:complete', (messageId) => {
      const completedMessage = streamingMessages[messageId];
      if (completedMessage) {
        setMessages(prev => {
          if (prev.some(m => m.id === messageId)) return prev;
          return [...prev, {
            id: messageId,
            threadId: completedMessage.threadId,
            role: 'assistant',
            content: completedMessage.content,
            createdAt: new Date(),
          }];
        });
      }
      setStreamingMessages(prev => {
        const { [messageId]: completed, ...rest } = prev;
        return rest;
      });
    });

    socketInstance.on('thread:tool:start', (data) => {
      setToolExecutions(prev => ({
        ...prev,
        [data.messageId]: [...(prev[data.messageId] || []), data]
      }));
    });

    socketInstance.on('thread:status', (status) => {
      setStatus(status);
    });

    socketInstance.on('thread:update', (data) => {
      setThreads(prev => 
        prev.map(thread => 
          thread.id === data.id 
            ? { ...thread, name: data.name }
            : thread
        )
      );
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [toast]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [threadData, threadsData] = await Promise.all([
          threadService.getById(threadId),
          threadService.getAgentThreads(agentId)
        ]);
        
        setMessages(threadData.messages as ThreadMessage[]);
        setThreads(threadsData);

        if (socket) {
          socket.emit('thread:join', threadId);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load chat data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (socket) {
      loadData();
    }

    return () => {
      if (socket) {
        socket.emit('thread:leave', threadId);
      }
    };
  }, [threadId, agentId, socket, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !message.trim()) return;

    socket.emit('thread:message:send', {
      threadId,
      content: message,
    }, (response) => {
      if (response.success && response.message) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === response.message!.id);
          if (exists) return prev;
          return [...prev, response.message!];
        });
        setMessage("");
      } else if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      }
    });
  };

  const handleNewThread = async () => {
    try {
      const thread = await threadService.createForAgent(agentId);
      router.push(`/workspace/${workspaceId}/agent/${agentId}/thread/${thread.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new thread",
        variant: "destructive",
      });
    }
  };

  const handleDeleteThread = async (threadId: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    if (deletingThreads.has(threadId)) return;

    try {
      setDeletingThreads(prev => {
        const newSet = new Set(prev);
        newSet.add(threadId);
        return newSet;
      });
      await threadService.delete(threadId);
      setThreads(prev => prev.filter(t => t.id !== threadId));
      
      // If we're deleting the current thread, redirect to the latest thread or the thread creation page
      if (Number(params.threadId) === threadId) {
        const remainingThreads = threads.filter(t => t.id !== threadId);
        if (remainingThreads.length > 0) {
          router.replace(`/workspace/${workspaceId}/agent/${agentId}/thread/${remainingThreads[0].id}`);
        } else {
          router.replace(`/workspace/${workspaceId}/agent/${agentId}/thread`);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete thread",
        variant: "destructive",
      });
    } finally {
      setDeletingThreads(prev => {
        const newSet = new Set(prev);
        newSet.delete(threadId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleNewThread}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Thread
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/workspace/${workspaceId}/agent/${agentId}/thread/${thread.id}`}
              >
                <div
                  className={cn(
                    "p-3 rounded-lg hover:bg-muted flex items-center space-x-3 cursor-pointer group",
                    thread.id === threadId && "bg-muted"
                  )}
                >
                  <MessageSquare className="h-5 w-5" />
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium">{thread.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8"
                    onClick={(e) => handleDeleteThread(thread.id, e)}
                    disabled={deletingThreads.has(thread.id)}
                  >
                    {deletingThreads.has(thread.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    )}
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <MessageToolExecution messageId={msg.id} toolExecutions={toolExecutions} />
                  <div className={cn(
                    "text-sm prose dark:prose-invert max-w-none prose-sm",
                    msg.role === "user" && "prose-p:text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground prose-code:text-primary-foreground prose-ul:text-primary-foreground prose-ol:text-primary-foreground"
                  )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {/* Render streaming messages */}
            {Object.values(streamingMessages).map((msg) => (
              <div
                key={msg.messageId}
                className="flex w-full justify-start"
              >
                <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                  <MessageToolExecution messageId={msg.messageId} toolExecutions={toolExecutions} />
                  <div className="text-sm prose dark:prose-invert max-w-none prose-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <AutoExpandingTextarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={status?.status === 'typing'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button type="submit" disabled={!message.trim() || status?.status === 'typing'}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 