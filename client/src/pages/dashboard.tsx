import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  User, 
  Wallet, 
  Ticket, 
  Building2, 
  ArrowRight,
  Car,
  Package,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { SkeletonCard } from "@/components/skeleton-card";
import { ErrorPanel } from "@/components/error-panel";
import type { UserMe, CustomerMe, CustomerWallet, ServiceCenterStatus } from "@shared/schema";

export default function DashboardPage() {
  const userQuery = useQuery<UserMe>({
    queryKey: ["/api/users/me"],
  });

  const customerQuery = useQuery<CustomerMe>({
    queryKey: ["/api/customers/me"],
  });

  const walletQuery = useQuery<CustomerWallet>({
    queryKey: ["/api/customer-wallet"],
  });

  const serviceCenterStatusQuery = useQuery<ServiceCenterStatus>({
    queryKey: ["/api/service-center/status"],
  });

  const isLoading = userQuery.isLoading || customerQuery.isLoading || walletQuery.isLoading;
  const hasError = userQuery.isError && customerQuery.isError;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back! Here's an overview of your account."
      />

      {hasError && (
        <ErrorPanel 
          message="Failed to load dashboard data" 
          onRetry={() => {
            userQuery.refetch();
            customerQuery.refetch();
            walletQuery.refetch();
          }} 
        />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </>
        ) : (
          <>
            <Card data-testid="card-user-info">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
                <User className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold truncate" data-testid="text-user-name">
                  {userQuery.data?.name || customerQuery.data?.name || "—"}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {userQuery.data?.email || customerQuery.data?.email || "No email"}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-wallet">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
                <Wallet className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold" data-testid="text-wallet-balance">
                  {walletQuery.data ? (
                    `${walletQuery.data.currency} ${walletQuery.data.balance.toLocaleString()}`
                  ) : (
                    "—"
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {walletQuery.data?.credits ? `${walletQuery.data.credits} credits available` : "Available balance"}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-tickets">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quick Stats</CardTitle>
                <Ticket className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-2xl font-semibold">—</div>
                    <p className="text-xs text-muted-foreground">Active tickets</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-service-center">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Service Center</CardTitle>
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {serviceCenterStatusQuery.data ? (
                  <>
                    <div className="flex items-center gap-2">
                      {serviceCenterStatusQuery.data.is_open ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Open
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          Closed
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {serviceCenterStatusQuery.data.current_queue > 0 
                        ? `${serviceCenterStatusQuery.data.current_queue} in queue`
                        : "No queue"}
                    </p>
                  </>
                ) : (
                  <div className="text-2xl font-semibold">—</div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/tickets">
              <Button variant="outline" className="w-full justify-between h-auto py-3" data-testid="button-new-ticket">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Create Ticket</div>
                    <div className="text-xs text-muted-foreground">Start a new service request</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/vehicles">
              <Button variant="outline" className="w-full justify-between h-auto py-3" data-testid="button-browse-vehicles">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10">
                    <Car className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Browse Vehicles</div>
                    <div className="text-xs text-muted-foreground">Search makes and models</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/products">
              <Button variant="outline" className="w-full justify-between h-auto py-3" data-testid="button-view-products">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">View Products</div>
                    <div className="text-xs text-muted-foreground">Explore available services</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
            <CardDescription>Current service availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm">API Services</span>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm">Connector Services</span>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Real-time Updates</span>
              </div>
              <Badge variant="outline">WebSocket</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
