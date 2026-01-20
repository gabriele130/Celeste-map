import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Search, User, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { SkeletonCard } from "@/components/skeleton-card";
import type { Chat } from "@shared/schema";

export default function ChatsPage() {
  const [chatId, setChatId] = useState("");
  const [searchChatId, setSearchChatId] = useState("");

  const chatQuery = useQuery<Chat>({
    queryKey: ["/api/chats", searchChatId],
    enabled: !!searchChatId,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchChatId(chatId);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Chats"
        description="View chat conversations and messages"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Chats" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chat Viewer</CardTitle>
          <CardDescription>Enter a chat ID to view the conversation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Chat ID..."
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="pl-9"
                data-testid="input-chat-id"
              />
            </div>
            <Button type="submit" data-testid="button-search-chat">
              View Chat
            </Button>
          </form>

          {!searchChatId && (
            <EmptyState
              icon={MessageSquare}
              title="Enter a Chat ID"
              description="Provide a chat ID to view the conversation and messages"
            />
          )}

          {searchChatId && chatQuery.isLoading && <SkeletonCard lines={8} />}

          {searchChatId && chatQuery.isError && (
            <ErrorPanel message="Failed to load chat" onRetry={() => chatQuery.refetch()} />
          )}

          {searchChatId && chatQuery.data && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Chat #{chatQuery.data.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(chatQuery.data.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={chatQuery.data.status === "active" ? "default" : "secondary"}>
                  {chatQuery.data.status}
                </Badge>
              </div>

              {chatQuery.data.participants && chatQuery.data.participants.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Participants:</span>
                  <div className="flex -space-x-2">
                    {chatQuery.data.participants.map((participant, index) => (
                      <Avatar key={index} className="w-8 h-8 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {participant.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              )}

              <div className="border rounded-lg">
                <div className="p-3 border-b bg-muted/30">
                  <h4 className="font-medium text-sm">Messages ({chatQuery.data.messages.length})</h4>
                </div>
                <ScrollArea className="h-96">
                  {chatQuery.data.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">No messages in this chat</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {chatQuery.data.messages.map((message) => (
                        <div
                          key={message.id}
                          className="flex gap-3"
                          data-testid={`message-${message.id}`}
                        >
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="text-xs">
                              {message.sender.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{message.sender}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm mt-1 break-words">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
