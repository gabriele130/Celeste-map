import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingCart, Plus, Trash2, Loader2, Calculator } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { calculatePricesSchema, type CalculatePricesRequest, type CartPricesResponse } from "@shared/schema";
import { z } from "zod";

const cartFormSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.coerce.number().min(1, "Required"),
      quantity: z.coerce.number().min(1, "Min 1"),
      vehicle_variant_id: z.coerce.number().optional(),
    })
  ).min(1, "Add at least one item"),
  vin: z.string().optional(),
});

type CartFormValues = z.infer<typeof cartFormSchema>;

export default function CartPage() {
  const { toast } = useToast();
  const [priceResult, setPriceResult] = useState<CartPricesResponse | null>(null);

  const form = useForm<CartFormValues>({
    resolver: zodResolver(cartFormSchema),
    defaultValues: {
      items: [{ product_id: 0, quantity: 1 }],
      vin: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: CalculatePricesRequest) => {
      const res = await apiRequest("POST", "/api/cart/calculate-prices", data);
      return res as CartPricesResponse;
    },
    onSuccess: (data) => {
      setPriceResult(data);
      toast({ title: "Prices calculated", description: "Price breakdown is ready" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Calculation failed", description: error.message });
    },
  });

  const onSubmit = (data: CartFormValues) => {
    const request: CalculatePricesRequest = {
      items: data.items.filter((item) => item.product_id > 0).map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        vehicle_variant_id: item.vehicle_variant_id || undefined,
      })),
      vin: data.vin || undefined,
    };
    calculateMutation.mutate(request);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Cart"
        description="Calculate prices for selected products"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Cart" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Price Calculator
            </CardTitle>
            <CardDescription>
              Add products and quantities to calculate the total price
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. VF1CN04054456164" 
                          {...field} 
                          data-testid="input-vin"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel>Cart Items</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ product_id: 0, quantity: 1 })}
                      data-testid="button-add-item"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  {fields.length === 0 && (
                    <EmptyState
                      icon={ShoppingCart}
                      title="No items"
                      description="Add items to calculate prices"
                      actionLabel="Add Item"
                      onAction={() => append({ product_id: 0, quantity: 1 })}
                    />
                  )}

                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`items.${index}.product_id`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Product ID"
                                {...field}
                                data-testid={`input-product-id-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Qty"
                                min={1}
                                {...field}
                                data-testid={`input-quantity-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.vehicle_variant_id`}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Variant ID"
                                {...field}
                                value={field.value || ""}
                                data-testid={`input-variant-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        data-testid={`button-remove-item-${index}`}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={calculateMutation.isPending}
                  data-testid="button-calculate"
                >
                  {calculateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="w-4 h-4 mr-2" />
                  )}
                  Calculate Prices
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Price Breakdown</CardTitle>
            <CardDescription>
              {priceResult ? "Calculated prices for your items" : "Submit the form to see prices"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculateMutation.isError && (
              <ErrorPanel 
                message="Failed to calculate prices" 
                onRetry={() => form.handleSubmit(onSubmit)()} 
              />
            )}

            {!priceResult && !calculateMutation.isError && (
              <EmptyState
                icon={ShoppingCart}
                title="No calculation yet"
                description="Add items and click calculate to see the price breakdown"
              />
            )}

            {priceResult && (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceResult.items.map((item, index) => (
                      <TableRow key={index} data-testid={`row-price-${index}`}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {item.currency} {item.unit_price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.currency} {item.total_price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{priceResult.currency} {priceResult.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{priceResult.currency} {priceResult.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {priceResult.currency} {priceResult.total.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
