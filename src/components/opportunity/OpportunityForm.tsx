
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OpportunityType } from "@/types/database/enums";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { OpportunityBasicInfo } from "./form/OpportunityBasicInfo";
import { OpportunityCategoriesSection } from "./form/OpportunityCategoriesSection";
import { OpportunityTagsSection } from "./form/OpportunityTagsSection";

interface OpportunityFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

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
        <OpportunityBasicInfo 
          form={form} 
          description={description} 
          setDescription={setDescription} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OpportunityCategoriesSection 
            form={form} 
            categories={form.watch("categories") || []} 
            handleCategorySelect={handleCategorySelect} 
          />

          <OpportunityTagsSection 
            form={form} 
            tagInput={tagInput} 
            setTagInput={setTagInput} 
            handleAddTag={handleAddTag} 
            handleRemoveTag={handleRemoveTag} 
          />
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
