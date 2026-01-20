import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, User, Wallet, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { SkeletonCard } from "@/components/skeleton-card";
import { ErrorPanel } from "@/components/error-panel";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { editCustomerSchema, type UserMe, type CustomerMe, type CustomerWallet, type EditCustomerRequest } from "@shared/schema";

export default function ProfilePage() {
  const { toast } = useToast();

  const userQuery = useQuery<UserMe>({
    queryKey: ["/api/users/me"],
  });

  const customerQuery = useQuery<CustomerMe>({
    queryKey: ["/api/customers/me"],
  });

  const walletQuery = useQuery<CustomerWallet>({
    queryKey: ["/api/customer-wallet"],
  });

  const form = useForm<EditCustomerRequest>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postal_code: "",
      country: "",
      company_name: "",
      vat_number: "",
    },
    values: customerQuery.data ? {
      name: customerQuery.data.name || "",
      email: customerQuery.data.email || "",
      phone: customerQuery.data.phone || "",
      address: customerQuery.data.address || "",
      city: customerQuery.data.city || "",
      postal_code: customerQuery.data.postal_code || "",
      country: customerQuery.data.country || "",
      company_name: customerQuery.data.company_name || "",
      vat_number: customerQuery.data.vat_number || "",
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EditCustomerRequest) => {
      return apiRequest("PUT", "/api/customers/me", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers/me"] });
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Update failed", description: error.message });
    },
  });

  const isLoading = userQuery.isLoading || customerQuery.isLoading;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Profile" 
        description="Manage your account information and settings"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile" },
        ]}
      />

      {(userQuery.isError || customerQuery.isError) && (
        <ErrorPanel 
          message="Failed to load profile data" 
          onRetry={() => {
            userQuery.refetch();
            customerQuery.refetch();
          }} 
        />
      )}

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account" data-testid="tab-account">
            <User className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="wallet" data-testid="tab-wallet">
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="company" data-testid="tab-company">
            <Building2 className="w-4 h-4 mr-2" />
            Company
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          {isLoading ? (
            <SkeletonCard lines={6} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-country" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem className="max-w-xs">
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-postal-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-profile">
                        {updateMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="wallet">
          {walletQuery.isLoading ? (
            <SkeletonCard lines={4} />
          ) : walletQuery.isError ? (
            <ErrorPanel message="Failed to load wallet data" onRetry={() => walletQuery.refetch()} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Wallet</CardTitle>
                <CardDescription>Your current balance and credits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                    <p className="text-3xl font-semibold" data-testid="text-balance">
                      {walletQuery.data?.currency || "EUR"} {walletQuery.data?.balance?.toLocaleString() || "0.00"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground mb-1">Credits</p>
                    <p className="text-3xl font-semibold" data-testid="text-credits">
                      {walletQuery.data?.credits?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="company">
          {isLoading ? (
            <SkeletonCard lines={4} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Business details for invoicing</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="company_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-company-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vat_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Number</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-vat-number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-company">
                        {updateMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
