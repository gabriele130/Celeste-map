import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ticket, Search, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { SkeletonTable } from "@/components/skeleton-card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { createTicketSchema, type PreparedTicketsResponse, type CreateTicketRequest } from "@shared/schema";

const ITEMS_PER_PAGE = 10;

export default function TicketsPage() {
  const { toast } = useToast();
  const [vinSearch, setVinSearch] = useState("");
  const [searchVin, setSearchVin] = useState("");
  const [offset, setOffset] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const ticketsQuery = useQuery<PreparedTicketsResponse>({
    queryKey: ["/api/prepared-tickets", searchVin, ITEMS_PER_PAGE, offset],
    enabled: !!searchVin,
  });

  const form = useForm<CreateTicketRequest>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      connector_id: 0,
      product_id: 0,
      vehicle_variant_id: undefined,
      vin: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateTicketRequest) => {
      return apiRequest("POST", "/api/tickets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prepared-tickets"] });
      toast({ title: "Ticket created", description: "Your ticket has been submitted successfully" });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to create ticket", description: error.message });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchVin(vinSearch);
    setOffset(0);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "secondary",
      active: "default",
      completed: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status.toLowerCase()] || "outline"}>{status}</Badge>;
  };

  const totalPages = ticketsQuery.data ? Math.ceil(ticketsQuery.data.total / ITEMS_PER_PAGE) : 0;
  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Tickets"
        description="View prepared tickets and create new service requests"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tickets" },
        ]}
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-ticket">
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
                <DialogDescription>
                  Submit a new service request for your vehicle
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="connector_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Connector ID *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-connector-id"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="product_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product ID *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-product-id"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIN</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. VF1CN04054456164" 
                            {...field} 
                            data-testid="input-ticket-vin"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicle_variant_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Variant ID</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            data-testid="input-variant-id"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes..." 
                            {...field} 
                            data-testid="input-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCreateDialogOpen(false)}
                      data-testid="button-cancel-ticket"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-ticket">
                      {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Ticket
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prepared Tickets</CardTitle>
          <CardDescription>Search for tickets by VIN number</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Enter VIN to search..."
                value={vinSearch}
                onChange={(e) => setVinSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-vin"
              />
            </div>
            <Button type="submit" data-testid="button-search-tickets">
              Search
            </Button>
          </form>

          {!searchVin && (
            <EmptyState
              icon={Ticket}
              title="Search for tickets"
              description="Enter a VIN number to find prepared tickets"
            />
          )}

          {searchVin && ticketsQuery.isLoading && <SkeletonTable rows={5} columns={5} />}

          {searchVin && ticketsQuery.isError && (
            <ErrorPanel message="Failed to load tickets" onRetry={() => ticketsQuery.refetch()} />
          )}

          {searchVin && ticketsQuery.data && ticketsQuery.data.result.length === 0 && (
            <EmptyState
              icon={Ticket}
              title="No tickets found"
              description={`No prepared tickets found for VIN: ${searchVin}`}
            />
          )}

          {searchVin && ticketsQuery.data && ticketsQuery.data.result.length > 0 && (
            <>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>VIN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketsQuery.data.result.map((ticket) => (
                      <TableRow key={ticket.id} data-testid={`row-ticket-${ticket.id}`}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell className="font-mono text-sm">{ticket.vin}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {ticket.vehicle_description || "—"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {ticket.product_description || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {offset + 1} to {Math.min(offset + ITEMS_PER_PAGE, ticketsQuery.data.total)} of {ticketsQuery.data.total} tickets
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOffset(Math.max(0, offset - ITEMS_PER_PAGE))}
                      disabled={offset === 0}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOffset(offset + ITEMS_PER_PAGE)}
                      disabled={currentPage >= totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
