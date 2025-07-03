
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ScholarshipFilters as ScholarshipFiltersType } from "@/types/scholarship/filters";

interface ScholarshipFiltersProps {
  onFilterChange: (filters: Partial<ScholarshipFiltersType>) => void;
  categories: string[];
}

export function ScholarshipFilters({ onFilterChange, categories }: ScholarshipFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [selectedDeadline, setSelectedDeadline] = useState<Date>();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange({ search: value || undefined });
  };

  const handleCategoryChange = (value: string) => {
    const categoryValue = value === "all" ? "" : value;
    setSelectedCategory(categoryValue);
    onFilterChange({ category: categoryValue || undefined });
  };

  const handleAmountChange = (value: string) => {
    const amountValue = value === "all" ? "" : value;
    setSelectedAmount(amountValue);
    onFilterChange({ amount: amountValue || undefined });
  };

  const handleDeadlineChange = (date: Date | undefined) => {
    setSelectedDeadline(date);
    onFilterChange({ deadline: date });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedAmount("");
    setSelectedDeadline(undefined);
    onFilterChange({
      search: undefined,
      category: undefined,
      amount: undefined,
      deadline: undefined
    });
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedAmount || selectedDeadline;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Scholarships
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scholarships..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Award Amount</label>
          <Select value={selectedAmount} onValueChange={handleAmountChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select amount range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Amounts</SelectItem>
              <SelectItem value="0-1000">$0 - $1,000</SelectItem>
              <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
              <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
              <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
              <SelectItem value="25000">$25,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deadline Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Application Deadline</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDeadline && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDeadline ? format(selectedDeadline, "PPP") : "Select deadline"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDeadline}
                onSelect={handleDeadlineChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
