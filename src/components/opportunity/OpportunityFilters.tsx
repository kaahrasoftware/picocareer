import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OpportunityFilters as IOpportunityFilters } from "@/types/opportunity/types";
import { MapPin, Calendar, Globe, DollarSign, Award } from "lucide-react";
import { useOpportunityCategories } from "@/hooks/useOpportunityCategories";
interface OpportunityFiltersProps {
  filters: IOpportunityFilters;
  onFilterChange: (filters: Partial<IOpportunityFilters>) => void;
}
export function OpportunityFilters({
  filters,
  onFilterChange
}: OpportunityFiltersProps) {
  // Fetch categories from database
  const {
    data: allCategories,
    isLoading: loadingCategories
  } = useOpportunityCategories();
  const handleCategoryChange = (category: string) => {
    onFilterChange({
      category: category === filters.category ? undefined : category
    });
  };
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      location: e.target.value
    });
  };
  const handleRemoteChange = (checked: boolean) => {
    onFilterChange({
      remote: checked
    });
  };
  const handleFeaturedChange = (checked: boolean) => {
    onFilterChange({
      featured: checked
    });
  };
  const resetFilters = () => {
    onFilterChange({
      type: "all",
      search: "",
      category: undefined,
      featured: undefined,
      remote: undefined,
      location: undefined
    });
  };
  const hasActiveFilters = () => {
    return filters.category !== undefined || filters.featured !== undefined || filters.remote !== undefined || filters.location !== undefined;
  };
  return <div className="border rounded-lg p-5 space-y-6 bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters() && <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
            Reset
          </Button>}
      </div>

      <Accordion type="multiple" className="w-full" defaultValue={["category", "location", "features"]}>
        <AccordionItem value="category" className="border-b">
          <AccordionTrigger className="text-base hover:no-underline">
            <span className="flex items-center gap-2">
              
              Categories
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {loadingCategories ? <div className="py-2 text-sm text-muted-foreground">Loading categories...</div> : <div className="space-y-2 pt-2">
                {allCategories && allCategories.map(category => <div key={category} className="flex items-center space-x-2">
                    <Checkbox id={`category-${category}`} checked={filters.category === category} onCheckedChange={() => handleCategoryChange(category)} />
                    <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                      {category}
                    </Label>
                  </div>)}
              </div>}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location" className="border-b">
          
          <AccordionContent>
            
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features" className="border-b">
          <AccordionTrigger className="text-base hover:no-underline">
            <span className="flex items-center gap-2">
              
              Features
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="featured" checked={filters.featured === true} onCheckedChange={checked => handleFeaturedChange(!!checked)} />
                <Label htmlFor="featured" className="text-sm cursor-pointer">
                  Featured opportunities
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button className="w-full" onClick={() => onFilterChange({
      ...filters
    })}>
        Apply Filters
      </Button>
    </div>;
}