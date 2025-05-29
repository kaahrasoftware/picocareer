
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { BasicInputField } from "@/components/forms/fields/BasicInputField";
import { supabase } from "@/integrations/supabase/client";
import { 
  ResourceAccessLevel, 
  InstitutionResource 
} from "@/types/database/institutions";

interface ResourceFormProps {
  institutionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingResource?: InstitutionResource;
}

interface FormFields {
  title: string;
  description?: string;
  category?: string;
  file_url: string;
  access_level: ResourceAccessLevel;
}

export function ResourceForm({ 
  institutionId, 
  onSuccess,
  onCancel,
  existingResource 
}: ResourceFormProps) {
  const { toast } = useToast();

  const form = useForm<FormFields>({
    defaultValues: {
      title: existingResource?.title || "",
      description: existingResource?.description || "",
      category: existingResource?.category || "",
      file_url: existingResource?.file_url || "",
      access_level: existingResource?.access_level || "members"
    }
  });

  const onSubmit = async (data: FormFields) => {
    try {
      if (existingResource) {
        const { error } = await supabase
          .from('institution_resources')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResource.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('institution_resources')
          .insert({
            ...data,
            institution_id: institutionId,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Resource ${existingResource ? 'updated' : 'created'} successfully.`
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: "Error",
        description: "Failed to save resource. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInputField
          field={form.register("title")}
          label="Title"
          placeholder="Enter resource title"
          required
        />

        <BasicInputField
          field={form.register("description")}
          label="Description"
          placeholder="Enter resource description"
        />

        <BasicInputField
          field={form.register("category")}
          label="Category"
          placeholder="Enter resource category"
        />

        <div className="space-y-2">
          <ImageUpload
            control={form.control}
            name="file_url"
            label="Resource File"
            bucket="institution-files"
          />
        </div>

        <BasicInputField
          field={form.register("access_level")}
          label="Access Level"
          type="text"
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {form.formState.isSubmitting ? "Saving..." : "Save Resource"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
