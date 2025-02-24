
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResourceAccessLevel, HubResource, ResourceType } from "@/types/database/hubs";
import { ResourceBasicInfo } from "./forms/ResourceBasicInfo";
import { ResourceTypeSelect } from "./forms/ResourceTypeSelect";
import { ResourceUpload } from "./forms/ResourceUpload";
import { AccessLevelSelect } from "./forms/AccessLevelSelect";

interface ResourceFormProps {
  hubId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingResource?: HubResource;
}

interface FormFields {
  title: string;
  description?: string;
  category?: string;
  resource_type: ResourceType;
  document_type?: string;
  external_url?: string;
  file_url?: string;
  access_level: ResourceAccessLevel;
}

export function ResourceForm({ 
  hubId, 
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
      resource_type: existingResource?.resource_type || "document",
      document_type: existingResource?.document_type,
      external_url: existingResource?.external_url || "",
      file_url: existingResource?.file_url || "",
      access_level: existingResource?.access_level || "members"
    }
  });

  const resourceType = form.watch('resource_type');
  const documentType = form.watch('document_type');

  const onSubmit = async (data: FormFields) => {
    try {
      let file_url = data.file_url;
      let content_type = '';
      let original_filename = '';

      if (existingResource) {
        const { error } = await supabase
          .from('hub_resources')
          .update({
            ...data,
            file_url,
            content_type,
            original_filename,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResource.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hub_resources')
          .insert({
            ...data,
            file_url,
            content_type,
            original_filename,
            hub_id: hubId,
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
        <ResourceBasicInfo register={form.register} />
        
        <ResourceTypeSelect 
          control={form.control}
          resourceType={resourceType}
          documentType={documentType}
        />

        <ResourceUpload
          resourceType={resourceType}
          documentType={documentType}
          register={form.register}
          control={form.control}
          hubId={hubId}
        />

        <AccessLevelSelect control={form.control} />

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
