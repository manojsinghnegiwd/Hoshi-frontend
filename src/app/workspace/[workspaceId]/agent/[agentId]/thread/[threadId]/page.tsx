'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/components/chat-message";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Chat {
  id: number;
  name: string;
  messages: ThreadMessage[];
}

interface ThreadMessage {
  id: number;
  threadId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

interface ThreadStatus {
  threadId: number;
  status: 'typing' | 'idle';
}

export default function ChatPage() {
  const params = useParams();
  const workspaceId = Number(params.workspaceId);
  const agentId = Number(params.agentId);
  const threadId = params.threadId === 'new' ? null : Number(params.threadId);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<ThreadStatus | null>(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3001');
    
    socketInstance.on('thread:message', (message: ThreadMessage) => {
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === message.threadId) {
            return {
              ...chat,
              messages: [...chat.messages, message]
            };
          }
          return chat;
        });
      });
    });

    socketInstance.on('thread:status', (status: ThreadStatus) => {
      setStatus(status);
    });

    socketInstance.on('error', (error: string) => {
      console.error('Socket error:', error);
      // You might want to show this in the UI
    });

    setSocket(socketInstance);

    // If threadId is 'new', create a new thread
    if (!threadId && socket) {
      createNewChat();
    }

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createNewChat = () => {
    if (!socket) return;

    socket.emit('thread:create', {
      agentId,
      name: `New Chat ${chats.length + 1}`,
    }, (response) => {
      if (response.success && response.thread) {
        setChats(prev => [...prev, response.thread]);
        setActiveChat(response.thread);
        socket.emit('thread:join', response.thread.id);
      }
    });
  };

  const handleChatSelect = (chat: Chat) => {
    if (!socket) return;
    
    if (activeChat) {
      socket.emit('thread:leave', activeChat.id);
    }
    
    setActiveChat(chat);
    socket.emit('thread:join', chat.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !activeChat || !message.trim()) return;

    socket.emit('thread:message:send', {
      threadId: activeChat.id,
      content: message,
    }, (response) => {
      if (response.success) {
        setMessage("");
      }
    });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/50">
        <div className="p-4">
          <Button 
            className="w-full justify-start gap-2"
            onClick={createNewChat}
          >
            <PlusCircle size={20} />
            New Chat
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="flex flex-col gap-2 p-4">
            {chats.map((chat) => (
              <Link 
                href={`/workspace/${workspaceId}/agent/${agentId}/thread/${chat.id}`}
                key={chat.id}
              >
                <Button
                  variant={activeChat?.id === chat.id ? "default" : "ghost"}
                  className="w-full justify-start gap-2 h-auto py-3"
                >
                  <MessageSquare size={16} />
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{chat.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {chat.messages.length > 0 
                        ? new Date(chat.messages[chat.messages.length - 1].createdAt).toLocaleDateString()
                        : 'No messages'}
                    </span>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto">
            {activeChat?.messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                isUser={message.role === 'user'}
                timestamp={new Date(message.createdAt)}
              />
            ))}
            {status?.status === 'typing' && status.threadId === activeChat?.id && (
              <div className="text-sm text-muted-foreground italic">
                AI is typing...
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="max-w-3xl mx-auto">
            <form className="flex gap-4" onSubmit={handleSubmit}>
              <textarea
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 resize-none border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                type="submit" 
                disabled={!activeChat || !message.trim() || status?.status === 'typing'}
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 