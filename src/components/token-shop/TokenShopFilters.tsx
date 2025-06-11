
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface TokenPackage {
  id: string;
  name: string;
  description?: string;
  token_amount: number;
  price_usd: number;
  default_price: string;
  image_url?: string;
}

interface FilterState {
  priceRange: [number, number];
  tokenRange: [number, number];
  sortBy: string;
  searchQuery: string;
}

interface TokenShopFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  packages: TokenPackage[];
}

export function TokenShopFilters({ filters, onFiltersChange, packages }: TokenShopFiltersProps) {
  const maxPrice = Math.max(...packages.map(p => p.price_usd), 100);
  const maxTokens = Math.max(...packages.map(p => p.token_amount), 500);

  const handlePriceRangeChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [values[0], values[1]]
    });
  };

  const handleTokenRangeChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      tokenRange: [values[0], values[1]]
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: value
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      priceRange: [0, maxPrice],
      tokenRange: [0, maxTokens],
      sortBy: 'price-asc',
      searchQuery: ''
    });
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Filters
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label>Search Packages</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={maxPrice}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>

        {/* Token Range */}
        <div className="space-y-3">
          <Label>Token Amount</Label>
          <div className="px-2">
            <Slider
              value={filters.tokenRange}
              onValueChange={handleTokenRangeChange}
              max={maxTokens}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{filters.tokenRange[0]} tokens</span>
            <span>{filters.tokenRange[1]} tokens</span>
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="tokens-asc">Tokens: Low to High</SelectItem>
              <SelectItem value="tokens-desc">Tokens: High to Low</SelectItem>
              <SelectItem value="value-best">Best Value</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Packages: {packages.length}</div>
            <div>Price Range: ${Math.min(...packages.map(p => p.price_usd))} - ${Math.max(...packages.map(p => p.price_usd))}</div>
            <div>Token Range: {Math.min(...packages.map(p => p.token_amount))} - {Math.max(...packages.map(p => p.token_amount))}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
