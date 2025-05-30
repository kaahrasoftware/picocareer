
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOpportunityCategories } from "@/hooks/useOpportunityCategories";

interface OpportunityCategoriesSectionProps {
  form: any;
  categories: string[];
  handleCategorySelect: (category: string) => void;
}

// Predefined category options that should always appear
const PREDEFINED_CATEGORIES = [
  "Technology",
  "Education",
  "Business & Finance",
  "Research & Development",
  "Arts & Media",
  "Environmental",
  "Social Impact",
  "Government & Policy",
  "Data Science",
  "Marketing & Communications",
  "Human Resources",
  "Legal",
  "Consulting",
  "Manufacturing",
  "Retail & Commerce"
];

export function OpportunityCategoriesSection({ 
  form, 
  categories, 
  handleCategorySelect 
}: OpportunityCategoriesSectionProps) {
  const [customCategory, setCustomCategory] = useState("");
  
  // Fetch categories from opportunities table
  const { data: databaseCategories, isLoading } = useOpportunityCategories();

  // Merge predefined categories with database categories (removing duplicates)
  const availableCategories = [...new Set([
    ...PREDEFINED_CATEGORIES,
    ...(databaseCategories || [])
  ])].sort();
  
  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !form.watch("categories").includes(customCategory.trim())) {
      handleCategorySelect(customCategory.trim());
      setCustomCategory("");
    }
  };

  return (
    <FormField
      control={form.control}
      name="categories"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categories (Select up to 3)</FormLabel>
          <div className="flex flex-wrap gap-2 mb-4">
            {field.value?.map((category: string) => (
              <Badge
                key={category}
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100"
              >
                {category}
                <button
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          {/* Display available categories */}
          {isLoading ? (
            <div className="text-sm text-muted-foreground mb-4">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto p-1 mb-4">
              {availableCategories && availableCategories.length > 0 ? (
                availableCategories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={field.value?.includes(category) ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    onClick={() => handleCategorySelect(category)}
                    disabled={!field.value?.includes(category) && field.value?.length >= 3}
                  >
                    {category}
                  </Button>
                ))
              ) : (
                <div className="col-span-full text-sm text-muted-foreground">
                  No existing categories found. Add your own below.
                </div>
              )}
            </div>
          )}
          
          {/* Allow adding custom categories */}
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add custom category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomCategory();
                }
              }}
              disabled={form.watch("categories")?.length >= 3}
            />
            <Button 
              type="button" 
              onClick={handleAddCustomCategory} 
              disabled={form.watch("categories")?.length >= 3 || !customCategory.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <FormDescription>
            Categorize your opportunity to help people find it. 
            You can select from existing categories or add your own.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
