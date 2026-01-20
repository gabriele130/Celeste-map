import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Languages, MessageCircle, Paperclip, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { JsonViewer } from "@/components/json-viewer";
import { SkeletonCard } from "@/components/skeleton-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  translateTextSchema, 
  sendControlMessageSchema,
  type Channel, 
  type TranslateTextRequest, 
  type TranslateTextResponse,
  type SendControlMessageRequest,
  type ChannelAttachment 
} from "@shared/schema";

export default function MessengerPage() {
  const { toast } = useToast();
  const [channelId, setChannelId] = useState("");
  const [searchChannelId, setSearchChannelId] = useState("");
  const [translateResult, setTranslateResult] = useState<TranslateTextResponse | null>(null);
  const [controlMessageResult, setControlMessageResult] = useState<unknown>(null);

  const channelQuery = useQuery<Channel>({
    queryKey: ["/api/channels", searchChannelId],
    enabled: !!searchChannelId,
  });

  const attachmentsQuery = useQuery<ChannelAttachment[]>({
    queryKey: ["/api/channel-attachments", { channel_id: searchChannelId }],
    enabled: !!searchChannelId,
  });

  const translateForm = useForm<TranslateTextRequest>({
    resolver: zodResolver(translateTextSchema),
    defaultValues: {
      text: "",
      target_language: "en",
      source_language: "",
    },
  });

  const controlMessageForm = useForm<SendControlMessageRequest>({
    resolver: zodResolver(sendControlMessageSchema),
    defaultValues: {
      channel_id: "",
      message_type: "",
      payload: {},
    },
  });

  const translateMutation = useMutation({
    mutationFn: async (data: TranslateTextRequest) => {
      const res = await apiRequest("POST", "/api/translate", data);
      return res as TranslateTextResponse;
    },
    onSuccess: (data) => {
      setTranslateResult(data);
      toast({ title: "Translation complete" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Translation failed", description: error.message });
    },
  });

  const controlMessageMutation = useMutation({
    mutationFn: async (data: SendControlMessageRequest) => {
      return apiRequest("POST", "/api/channel-actions/send-control-message", data);
    },
    onSuccess: (data) => {
      setControlMessageResult(data);
      toast({ title: "Control message sent" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to send message", description: error.message });
    },
  });

  const handleChannelSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchChannelId(channelId);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Messenger"
        description="Channel management and messaging tools"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Messenger" },
        ]}
      />

      <Tabs defaultValue="channel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="channel" data-testid="tab-channel">
            <MessageCircle className="w-4 h-4 mr-2" />
            Channel
          </TabsTrigger>
          <TabsTrigger value="translate" data-testid="tab-translate">
            <Languages className="w-4 h-4 mr-2" />
            Translate
          </TabsTrigger>
          <TabsTrigger value="control" data-testid="tab-control">
            <Send className="w-4 h-4 mr-2" />
            Control
          </TabsTrigger>
          <TabsTrigger value="attachments" data-testid="tab-attachments">
            <Paperclip className="w-4 h-4 mr-2" />
            Attachments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channel">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Channel Viewer</CardTitle>
              <CardDescription>View channel details by ID</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChannelSearch} className="flex gap-2 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter Channel ID..."
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="pl-9"
                    data-testid="input-channel-id"
                  />
                </div>
                <Button type="submit" data-testid="button-search-channel">
                  View Channel
                </Button>
              </form>

              {!searchChannelId && (
                <EmptyState
                  icon={MessageCircle}
                  title="Enter a Channel ID"
                  description="Provide a channel ID to view its details"
                />
              )}

              {searchChannelId && channelQuery.isLoading && <SkeletonCard lines={6} />}

              {searchChannelId && channelQuery.isError && (
                <ErrorPanel message="Failed to load channel" onRetry={() => channelQuery.refetch()} />
              )}

              {searchChannelId && channelQuery.data && (
                <div className="space-y-4">
                  <h4 className="font-medium">Channel Data</h4>
                  <JsonViewer data={channelQuery.data} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translate">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Text Translation</CardTitle>
              <CardDescription>Translate text between languages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <Form {...translateForm}>
                  <form
                    onSubmit={translateForm.handleSubmit((data) => translateMutation.mutate(data))}
                    className="space-y-4"
                  >
                    <FormField
                      control={translateForm.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Text to Translate *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter text to translate..."
                              className="min-h-24"
                              {...field}
                              data-testid="input-translate-text"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={translateForm.control}
                        name="source_language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source Language</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Auto-detect"
                                {...field}
                                data-testid="input-source-language"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={translateForm.control}
                        name="target_language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Language *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. en, de, fr"
                                {...field}
                                data-testid="input-target-language"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={translateMutation.isPending}
                      data-testid="button-translate"
                    >
                      {translateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Languages className="w-4 h-4 mr-2" />
                      Translate
                    </Button>
                  </form>
                </Form>

                <div className="space-y-4">
                  <h4 className="font-medium">Translation Result</h4>
                  {!translateResult ? (
                    <EmptyState
                      icon={Languages}
                      title="No translation yet"
                      description="Submit text to see the translation"
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm text-muted-foreground mb-1">
                          {translateResult.source_language} → {translateResult.target_language}
                        </p>
                        <p className="text-lg" data-testid="text-translated">
                          {translateResult.translated_text}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="control">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Control Message</CardTitle>
              <CardDescription>Send control messages to channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <Form {...controlMessageForm}>
                  <form
                    onSubmit={controlMessageForm.handleSubmit((data) => controlMessageMutation.mutate(data))}
                    className="space-y-4"
                  >
                    <FormField
                      control={controlMessageForm.control}
                      name="channel_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel ID *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-control-channel-id" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={controlMessageForm.control}
                      name="message_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Type *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. status_update"
                              {...field}
                              data-testid="input-message-type"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={controlMessageMutation.isPending}
                      data-testid="button-send-control"
                    >
                      {controlMessageMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </Form>

                <div className="space-y-4">
                  <h4 className="font-medium">Response</h4>
                  {!controlMessageResult ? (
                    <EmptyState
                      icon={Send}
                      title="No response yet"
                      description="Send a control message to see the response"
                    />
                  ) : (
                    <JsonViewer data={controlMessageResult} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Channel Attachments</CardTitle>
              <CardDescription>View attachments for a channel</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChannelSearch} className="flex gap-2 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter Channel ID..."
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="pl-9"
                    data-testid="input-attachments-channel-id"
                  />
                </div>
                <Button type="submit" data-testid="button-search-attachments">
                  View Attachments
                </Button>
              </form>

              {!searchChannelId && (
                <EmptyState
                  icon={Paperclip}
                  title="Enter a Channel ID"
                  description="Provide a channel ID to view its attachments"
                />
              )}

              {searchChannelId && attachmentsQuery.isLoading && <SkeletonCard lines={4} />}

              {searchChannelId && attachmentsQuery.isError && (
                <ErrorPanel message="Failed to load attachments" onRetry={() => attachmentsQuery.refetch()} />
              )}

              {searchChannelId && attachmentsQuery.data && (
                <div className="space-y-4">
                  <h4 className="font-medium">Attachments ({attachmentsQuery.data.length})</h4>
                  {attachmentsQuery.data.length === 0 ? (
                    <EmptyState
                      icon={Paperclip}
                      title="No attachments"
                      description="This channel has no attachments"
                    />
                  ) : (
                    <JsonViewer data={attachmentsQuery.data} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
