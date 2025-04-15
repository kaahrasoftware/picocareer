
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface OpportunityTagsSectionProps {
  form: any;
  tagInput: string;
  setTagInput: (value: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
}

export function OpportunityTagsSection({
  form,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
}: OpportunityTagsSectionProps) {
  return (
    <FormField
      control={form.control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags (Optional)</FormLabel>
          <div className="flex flex-wrap gap-2 mb-4">
            {field.value?.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-gray-100 text-gray-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" onClick={handleAddTag} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FormDescription className="mt-2">
            Enter keywords that describe this opportunity
          </FormDescription>
        </FormItem>
      )}
    />
  );
}
