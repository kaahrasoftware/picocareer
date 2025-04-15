
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface OpportunityCategoriesSectionProps {
  form: any;
  categories: string[];
  handleCategorySelect: (category: string) => void;
}

const CATEGORIES = [
  "Technology",
  "Healthcare",
  "Education",
  "Finance",
  "Engineering",
  "Marketing",
  "Design",
  "Research",
  "Non-profit",
  "Government",
  "Community Service",
  "Social Impact",
  "Environment",
  "Arts & Culture",
];

export function OpportunityCategoriesSection({ 
  form, 
  categories, 
  handleCategorySelect 
}: OpportunityCategoriesSectionProps) {
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
            {CATEGORIES.map((category) => (
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
            ))}
          </div>
          <FormDescription>
            Categorize your opportunity to help people find it
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
