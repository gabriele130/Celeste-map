import { useQuery } from "@tanstack/react-query";
import { Globe, Coins, Search } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { SkeletonTable } from "@/components/skeleton-card";
import { ErrorPanel } from "@/components/error-panel";
import { EmptyState } from "@/components/empty-state";
import type { Country, Currency } from "@shared/schema";

export default function SystemPage() {
  const [countrySearch, setCountrySearch] = useState("");
  const [currencySearch, setCurrencySearch] = useState("");

  const countriesQuery = useQuery<Country[]>({
    queryKey: ["/api/system/countries"],
  });

  const currenciesQuery = useQuery<Currency[]>({
    queryKey: ["/api/system/currencies"],
  });

  const filterCountries = (countries: Country[] | undefined) => {
    if (!countries) return [];
    if (!countrySearch) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.toLowerCase().includes(countrySearch.toLowerCase())
    );
  };

  const filterCurrencies = (currencies: Currency[] | undefined) => {
    if (!currencies) return [];
    if (!currencySearch) return currencies;
    return currencies.filter(
      (c) =>
        c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
        c.code.toLowerCase().includes(currencySearch.toLowerCase())
    );
  };

  const filteredCountries = filterCountries(countriesQuery.data);
  const filteredCurrencies = filterCurrencies(currenciesQuery.data);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="System"
        description="View system reference data"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "System" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reference Data</CardTitle>
          <CardDescription>Countries and currencies available in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="countries">
            <TabsList className="mb-4">
              <TabsTrigger value="countries" data-testid="tab-countries">
                <Globe className="w-4 h-4 mr-2" />
                Countries
              </TabsTrigger>
              <TabsTrigger value="currencies" data-testid="tab-currencies">
                <Coins className="w-4 h-4 mr-2" />
                Currencies
              </TabsTrigger>
            </TabsList>

            <TabsContent value="countries">
              <div className="relative mb-4 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-countries"
                />
              </div>

              {countriesQuery.isLoading && <SkeletonTable rows={8} columns={2} />}

              {countriesQuery.isError && (
                <ErrorPanel message="Failed to load countries" onRetry={() => countriesQuery.refetch()} />
              )}

              {filteredCountries.length === 0 && !countriesQuery.isLoading && (
                <EmptyState
                  icon={Globe}
                  title="No countries found"
                  description={countrySearch ? "Try a different search term" : "No countries available"}
                />
              )}

              {filteredCountries.length > 0 && (
                <div className="border rounded-md max-h-96 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-24">Code</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCountries.map((country) => (
                        <TableRow key={country.code} data-testid={`row-country-${country.code}`}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {country.code}
                            </Badge>
                          </TableCell>
                          <TableCell>{country.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {countriesQuery.data && (
                <p className="text-sm text-muted-foreground mt-4">
                  Showing {filteredCountries.length} of {countriesQuery.data.length} countries
                </p>
              )}
            </TabsContent>

            <TabsContent value="currencies">
              <div className="relative mb-4 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search currencies..."
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-currencies"
                />
              </div>

              {currenciesQuery.isLoading && <SkeletonTable rows={8} columns={3} />}

              {currenciesQuery.isError && (
                <ErrorPanel message="Failed to load currencies" onRetry={() => currenciesQuery.refetch()} />
              )}

              {filteredCurrencies.length === 0 && !currenciesQuery.isLoading && (
                <EmptyState
                  icon={Coins}
                  title="No currencies found"
                  description={currencySearch ? "Try a different search term" : "No currencies available"}
                />
              )}

              {filteredCurrencies.length > 0 && (
                <div className="border rounded-md max-h-96 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-24">Code</TableHead>
                        <TableHead className="w-20">Symbol</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCurrencies.map((currency) => (
                        <TableRow key={currency.code} data-testid={`row-currency-${currency.code}`}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {currency.code}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-lg">{currency.symbol}</TableCell>
                          <TableCell>{currency.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {currenciesQuery.data && (
                <p className="text-sm text-muted-foreground mt-4">
                  Showing {filteredCurrencies.length} of {currenciesQuery.data.length} currencies
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
