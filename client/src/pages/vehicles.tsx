import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Car, ChevronRight, Search, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { SkeletonList } from "@/components/skeleton-card";
import type { VehicleMake, VehicleModelGroup, VehicleModel, VehicleModelVariant } from "@shared/schema";

type ViewLevel = "makes" | "modelGroups" | "models" | "variants";

interface BreadcrumbItem {
  label: string;
  level: ViewLevel;
  id?: number;
}

export default function VehiclesPage() {
  const [viewLevel, setViewLevel] = useState<ViewLevel>("makes");
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [selectedModelGroup, setSelectedModelGroup] = useState<VehicleModelGroup | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const makesQuery = useQuery<VehicleMake[]>({
    queryKey: ["/api/vehicles/makes"],
    enabled: viewLevel === "makes",
  });

  const modelGroupsQuery = useQuery<VehicleModelGroup[]>({
    queryKey: ["/api/vehicles/model-groups", { make_id: selectedMake?.id?.toString() }],
    enabled: viewLevel === "modelGroups" && !!selectedMake,
  });

  const modelsQuery = useQuery<VehicleModel[]>({
    queryKey: ["/api/vehicles/models", { model_group_id: selectedModelGroup?.id?.toString() }],
    enabled: viewLevel === "models" && !!selectedModelGroup,
  });

  const variantsQuery = useQuery<VehicleModelVariant[]>({
    queryKey: ["/api/vehicles/model-variants", { model_id: selectedModel?.id?.toString() }],
    enabled: viewLevel === "variants" && !!selectedModel,
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Makes", level: "makes" },
  ];

  if (selectedMake) {
    breadcrumbs.push({ label: selectedMake.name, level: "modelGroups", id: selectedMake.id });
  }
  if (selectedModelGroup) {
    breadcrumbs.push({ label: selectedModelGroup.name, level: "models", id: selectedModelGroup.id });
  }
  if (selectedModel) {
    breadcrumbs.push({ label: selectedModel.name, level: "variants", id: selectedModel.id });
  }

  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    if (item.level === "makes") {
      setViewLevel("makes");
      setSelectedMake(null);
      setSelectedModelGroup(null);
      setSelectedModel(null);
    } else if (item.level === "modelGroups") {
      setViewLevel("modelGroups");
      setSelectedModelGroup(null);
      setSelectedModel(null);
    } else if (item.level === "models") {
      setViewLevel("models");
      setSelectedModel(null);
    }
    setSearchQuery("");
  };

  const handleMakeSelect = (make: VehicleMake) => {
    setSelectedMake(make);
    setViewLevel("modelGroups");
    setSearchQuery("");
  };

  const handleModelGroupSelect = (modelGroup: VehicleModelGroup) => {
    setSelectedModelGroup(modelGroup);
    setViewLevel("models");
    setSearchQuery("");
  };

  const handleModelSelect = (model: VehicleModel) => {
    setSelectedModel(model);
    setViewLevel("variants");
    setSearchQuery("");
  };

  const goBack = () => {
    if (viewLevel === "variants") {
      setSelectedModel(null);
      setViewLevel("models");
    } else if (viewLevel === "models") {
      setSelectedModelGroup(null);
      setViewLevel("modelGroups");
    } else if (viewLevel === "modelGroups") {
      setSelectedMake(null);
      setViewLevel("makes");
    }
    setSearchQuery("");
  };

  const filterItems = <T extends { name: string }>(items: T[] | undefined): T[] => {
    if (!items) return [];
    if (!searchQuery) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Vehicles"
        description="Browse vehicle makes, models, and variants"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Vehicles" },
        ]}
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {viewLevel !== "makes" && (
                <Button variant="ghost" size="icon" onClick={goBack} data-testid="button-back">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <nav className="flex items-center gap-1 text-sm">
                {breadcrumbs.map((item, index) => (
                  <span key={index} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <button
                      onClick={() => handleBreadcrumbClick(item)}
                      className={`hover:text-foreground transition-colors ${
                        index === breadcrumbs.length - 1 ? "font-medium" : "text-muted-foreground"
                      }`}
                      data-testid={`breadcrumb-${item.level}`}
                    >
                      {item.label}
                    </button>
                  </span>
                ))}
              </nav>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewLevel === "makes" && (
            <>
              {makesQuery.isLoading && <SkeletonList items={8} />}
              {makesQuery.isError && (
                <ErrorPanel message="Failed to load vehicle makes" onRetry={() => makesQuery.refetch()} />
              )}
              {makesQuery.data && filterItems(makesQuery.data).length === 0 && (
                <EmptyState
                  icon={Car}
                  title="No makes found"
                  description={searchQuery ? "Try a different search term" : "No vehicle makes available"}
                />
              )}
              {makesQuery.data && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {filterItems(makesQuery.data).map((make) => (
                    <button
                      key={make.id}
                      onClick={() => handleMakeSelect(make)}
                      className="flex items-center gap-3 p-3 rounded-md border hover-elevate transition-colors text-left"
                      data-testid={`make-${make.id}`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted">
                        <Car className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium flex-1">{make.name}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {viewLevel === "modelGroups" && (
            <>
              {modelGroupsQuery.isLoading && <SkeletonList items={6} />}
              {modelGroupsQuery.isError && (
                <ErrorPanel message="Failed to load model groups" onRetry={() => modelGroupsQuery.refetch()} />
              )}
              {modelGroupsQuery.data && filterItems(modelGroupsQuery.data).length === 0 && (
                <EmptyState
                  icon={Car}
                  title="No model groups found"
                  description={searchQuery ? "Try a different search term" : "No model groups available for this make"}
                />
              )}
              {modelGroupsQuery.data && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {filterItems(modelGroupsQuery.data).map((group) => (
                    <button
                      key={group.id}
                      onClick={() => handleModelGroupSelect(group)}
                      className="flex items-center gap-3 p-3 rounded-md border hover-elevate transition-colors text-left"
                      data-testid={`model-group-${group.id}`}
                    >
                      <span className="font-medium flex-1">{group.name}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {viewLevel === "models" && (
            <>
              {modelsQuery.isLoading && <SkeletonList items={6} />}
              {modelsQuery.isError && (
                <ErrorPanel message="Failed to load models" onRetry={() => modelsQuery.refetch()} />
              )}
              {modelsQuery.data && filterItems(modelsQuery.data).length === 0 && (
                <EmptyState
                  icon={Car}
                  title="No models found"
                  description={searchQuery ? "Try a different search term" : "No models available for this group"}
                />
              )}
              {modelsQuery.data && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {filterItems(modelsQuery.data).map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      className="flex items-center justify-between gap-3 p-3 rounded-md border hover-elevate transition-colors text-left"
                      data-testid={`model-${model.id}`}
                    >
                      <div>
                        <span className="font-medium">{model.name}</span>
                        {(model.year_from || model.year_to) && (
                          <p className="text-xs text-muted-foreground">
                            {model.year_from || "?"} - {model.year_to || "Present"}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {viewLevel === "variants" && (
            <>
              {variantsQuery.isLoading && <SkeletonList items={6} />}
              {variantsQuery.isError && (
                <ErrorPanel message="Failed to load variants" onRetry={() => variantsQuery.refetch()} />
              )}
              {variantsQuery.data && filterItems(variantsQuery.data).length === 0 && (
                <EmptyState
                  icon={Car}
                  title="No variants found"
                  description={searchQuery ? "Try a different search term" : "No variants available for this model"}
                />
              )}
              {variantsQuery.data && (
                <div className="space-y-2">
                  {filterItems(variantsQuery.data).map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-md border"
                      data-testid={`variant-${variant.id}`}
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{variant.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {variant.engine && (
                            <Badge variant="secondary" size="sm">{variant.engine}</Badge>
                          )}
                          {variant.fuel_type && (
                            <Badge variant="outline" size="sm">{variant.fuel_type}</Badge>
                          )}
                          {variant.power_kw && (
                            <Badge variant="outline" size="sm">{variant.power_kw} kW</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
