
import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OpportunityCategoriesSectionProps {
  form: any;
  categories: string[];
  handleCategorySelect: (category: string) => void;
}

export function OpportunityCategoriesSection({ 
  form, 
  categories, 
  handleCategorySelect 
}: OpportunityCategoriesSectionProps) {
  const [customCategory, setCustomCategory] = useState("");
  
  // Fetch categories from opportunities table
  const { data: availableCategories, isLoading } = useQuery({
    queryKey: ['opportunity-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('categories')
        .not('categories', 'is', null);
      
      if (error) throw error;
      
      // Extract unique categories from all opportunities
      const allCategories = data.flatMap(item => item.categories || []);
      const uniqueCategories = [...new Set(allCategories)];
      return uniqueCategories.sort();
    }
  });

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
          
          {/* Display existing categories from database */}
          {isLoading ? (
            <div className="text-sm text-muted-foreground mb-4">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1 mb-4">
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
