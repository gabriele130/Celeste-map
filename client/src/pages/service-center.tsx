import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Phone, Mail, Clock, Users, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { SkeletonCard } from "@/components/skeleton-card";
import { ErrorPanel } from "@/components/error-panel";
import type { ServiceCenter, ServiceCenterStatus } from "@shared/schema";

export default function ServiceCenterPage() {
  const serviceCenterQuery = useQuery<ServiceCenter>({
    queryKey: ["/api/service-center"],
  });

  const statusQuery = useQuery<ServiceCenterStatus>({
    queryKey: ["/api/service-center/status"],
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Service Center"
        description="View service center information and current status"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Service Center" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Service Center Details
            </CardTitle>
            <CardDescription>Contact and location information</CardDescription>
          </CardHeader>
          <CardContent>
            {serviceCenterQuery.isLoading && (
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </div>
            )}

            {serviceCenterQuery.isError && (
              <ErrorPanel 
                message="Failed to load service center details" 
                onRetry={() => serviceCenterQuery.refetch()} 
              />
            )}

            {serviceCenterQuery.data && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold" data-testid="text-center-name">
                    {serviceCenterQuery.data.name}
                  </h3>
                </div>

                <div className="space-y-3">
                  {serviceCenterQuery.data.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm">{serviceCenterQuery.data.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {[serviceCenterQuery.data.city, serviceCenterQuery.data.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {serviceCenterQuery.data.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <a
                        href={`tel:${serviceCenterQuery.data.phone}`}
                        className="text-sm hover:underline"
                        data-testid="link-phone"
                      >
                        {serviceCenterQuery.data.phone}
                      </a>
                    </div>
                  )}

                  {serviceCenterQuery.data.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <a
                        href={`mailto:${serviceCenterQuery.data.email}`}
                        className="text-sm hover:underline"
                        data-testid="link-email"
                      >
                        {serviceCenterQuery.data.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Status
            </CardTitle>
            <CardDescription>Real-time availability information</CardDescription>
          </CardHeader>
          <CardContent>
            {statusQuery.isLoading && (
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </div>
            )}

            {statusQuery.isError && (
              <ErrorPanel 
                message="Failed to load status" 
                onRetry={() => statusQuery.refetch()} 
              />
            )}

            {statusQuery.data && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  {statusQuery.data.is_open ? (
                    <>
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20 text-sm">
                          Open
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">Currently accepting customers</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10">
                        <XCircle className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <Badge variant="destructive" className="text-sm">
                          Closed
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">Currently not accepting customers</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Current Queue</span>
                    </div>
                    <p className="text-2xl font-semibold" data-testid="text-queue">
                      {statusQuery.data.current_queue}
                    </p>
                  </div>

                  {statusQuery.data.estimated_wait_time !== undefined && (
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Est. Wait Time</span>
                      </div>
                      <p className="text-2xl font-semibold" data-testid="text-wait-time">
                        {statusQuery.data.estimated_wait_time} min
                      </p>
                    </div>
                  )}

                  {statusQuery.data.available_slots !== undefined && (
                    <div className="p-4 rounded-lg bg-muted/50 border sm:col-span-2">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Available Slots</span>
                      </div>
                      <p className="text-2xl font-semibold" data-testid="text-available-slots">
                        {statusQuery.data.available_slots}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
