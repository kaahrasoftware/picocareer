
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OpportunityType } from "@/types/database/enums";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormRichEditor } from "../FormRichEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OpportunityFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
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

export function OpportunityForm({ initialData, onSubmit, isSubmitting }: OpportunityFormProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [description, setDescription] = useState(initialData?.description || "");
  const [tagInput, setTagInput] = useState("");
  
  const form = useForm({
    defaultValues: {
      title: initialData?.title || "",
      opportunity_type: initialData?.opportunity_type || "job",
      application_url: initialData?.application_url || "",
      categories: initialData?.categories || [],
      tags: initialData?.tags || [],
    },
  });

  const handleSubmit = (data: any) => {
    if (!description.trim()) {
      return;
    }

    const formattedData = {
      ...data,
      description,
      // Include provider_name from profile or empty if needed for the database
      provider_name: profile?.full_name || "Anonymous",
    };

    onSubmit(formattedData);
  };

  const opportunityTypes: { value: OpportunityType; label: string }[] = [
    { value: "job", label: "Job" },
    { value: "internship", label: "Internship" },
    { value: "scholarship", label: "Scholarship" },
    { value: "fellowship", label: "Fellowship" },
    { value: "grant", label: "Grant" },
    { value: "competition", label: "Competition" },
    { value: "event", label: "Event" },
    { value: "volunteer", label: "Volunteer Opportunity" },
    { value: "other", label: "Other" },
  ];

  // Tag management
  const handleAddTag = () => {
    if (tagInput.trim() && !form.watch("tags").includes(tagInput.trim())) {
      const currentTags = form.watch("tags") || [];
      form.setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.watch("tags") || [];
    form.setValue("tags", currentTags.filter((t: string) => t !== tag));
  };

  // Category management
  const handleCategorySelect = (category: string) => {
    const currentCategories = form.watch("categories") || [];
    if (!currentCategories.includes(category)) {
      if (currentCategories.length < 3) {
        form.setValue("categories", [...currentCategories, category]);
      }
    } else {
      form.setValue("categories", currentCategories.filter((c: string) => c !== category));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opportunity Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter the opportunity title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="opportunity_type"
          rules={{ required: "Opportunity type is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opportunity Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select opportunity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {opportunityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel htmlFor="description">Description</FormLabel>
          <FormRichEditor
            value={description}
            onChange={setDescription}
            placeholder="Enter a detailed description of the opportunity"
          />
          {!description.trim() && (
            <p className="text-sm text-destructive">Description is required</p>
          )}
        </div>

        <FormField
          control={form.control}
          name="application_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application URL (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/apply" 
                  type="url" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                If provided, applicants will be directed to this URL to apply
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
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
          </div>

          <div>
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
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Opportunity"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
