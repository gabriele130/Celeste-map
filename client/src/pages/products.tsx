import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Package, Heart, Star, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { SkeletonList } from "@/components/skeleton-card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product, ProductGroup } from "@shared/schema";

export default function ProductsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const productsQuery = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const productGroupsQuery = useQuery<ProductGroup[]>({
    queryKey: ["/api/product-groups"],
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("POST", "/api/favorite-products", { product_id: productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Added to favorites" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to add favorite", description: error.message });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("DELETE", `/api/favorite-products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Removed from favorites" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to remove favorite", description: error.message });
    },
  });

  const toggleFavorite = (product: Product) => {
    if (product.is_favorite) {
      removeFavoriteMutation.mutate(product.id);
    } else {
      addFavoriteMutation.mutate(product.id);
    }
  };

  const filterProducts = (products: Product[] | undefined) => {
    if (!products) return [];
    if (!searchQuery) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const favoriteProducts = productsQuery.data?.filter((p) => p.is_favorite) || [];
  const allProducts = filterProducts(productsQuery.data);

  const isToggling = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Products"
        description="Browse available products and manage your favorites"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products" },
        ]}
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-lg">Product Catalog</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-products"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all" data-testid="tab-all-products">
                <Package className="w-4 h-4 mr-2" />
                All Products
              </TabsTrigger>
              <TabsTrigger value="favorites" data-testid="tab-favorites">
                <Heart className="w-4 h-4 mr-2" />
                Favorites ({favoriteProducts.length})
              </TabsTrigger>
              <TabsTrigger value="groups" data-testid="tab-product-groups">
                <Star className="w-4 h-4 mr-2" />
                Product Groups
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {productsQuery.isLoading && <SkeletonList items={6} />}
              {productsQuery.isError && (
                <ErrorPanel message="Failed to load products" onRetry={() => productsQuery.refetch()} />
              )}
              {allProducts.length === 0 && !productsQuery.isLoading && (
                <EmptyState
                  icon={Package}
                  title="No products found"
                  description={searchQuery ? "Try a different search term" : "No products available at the moment"}
                />
              )}
              {allProducts.length > 0 && (
                <div className="space-y-3">
                  {allProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-md border"
                      data-testid={`product-${product.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{product.name}</h3>
                          {product.is_favorite && (
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          )}
                        </div>
                        {product.description && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {product.price !== undefined && (
                          <Badge variant="secondary">
                            {product.currency || "EUR"} {product.price.toFixed(2)}
                          </Badge>
                        )}
                        <Button
                          variant={product.is_favorite ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleFavorite(product)}
                          disabled={isToggling}
                          data-testid={`button-favorite-${product.id}`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Heart className={`w-4 h-4 ${product.is_favorite ? "fill-current" : ""}`} />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              {favoriteProducts.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="No favorites yet"
                  description="Add products to your favorites for quick access"
                />
              ) : (
                <div className="space-y-3">
                  {favoriteProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-md border"
                      data-testid={`favorite-${product.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {product.price !== undefined && (
                          <Badge variant="secondary">
                            {product.currency || "EUR"} {product.price.toFixed(2)}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFavoriteMutation.mutate(product.id)}
                          disabled={removeFavoriteMutation.isPending}
                          data-testid={`button-remove-favorite-${product.id}`}
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="groups">
              {productGroupsQuery.isLoading && <SkeletonList items={4} />}
              {productGroupsQuery.isError && (
                <ErrorPanel message="Failed to load product groups" onRetry={() => productGroupsQuery.refetch()} />
              )}
              {productGroupsQuery.data?.length === 0 && (
                <EmptyState
                  icon={Star}
                  title="No product groups"
                  description="Product groups are not available"
                />
              )}
              {productGroupsQuery.data && productGroupsQuery.data.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {productGroupsQuery.data.map((group) => (
                    <Card key={group.id} data-testid={`product-group-${group.id}`}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
