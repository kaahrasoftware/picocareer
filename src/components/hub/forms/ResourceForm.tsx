
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResourceAccessLevel, HubResource, ResourceType, DocumentType } from "@/types/database/hubs";
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
  document_type?: DocumentType;
  external_url?: string;
  file_url?: string;
  size_in_bytes: number;
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
      size_in_bytes: existingResource?.size_in_bytes || 0,
      access_level: existingResource?.access_level || "members"
    }
  });

  const resourceType = form.watch('resource_type');
  const documentType = form.watch('document_type');

  const onSubmit = async (data: FormFields) => {
    try {
      const user = await supabase.auth.getUser();
      const insertData = {
        ...data,
        hub_id: hubId,
        created_by: user.data.user?.id,
      };

      console.log('Saving resource with size:', data.size_in_bytes, 'bytes');

      // For updates, we only want to update specific fields
      if (existingResource) {
        const { error } = await supabase
          .from('hub_resources')
          .update({
            title: data.title,
            description: data.description,
            category: data.category,
            resource_type: data.resource_type,
            document_type: data.document_type,
            external_url: data.external_url,
            file_url: data.file_url,
            size_in_bytes: data.size_in_bytes || 0,
            access_level: data.access_level,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResource.id);

        if (error) throw error;
      } else {
        console.log('Creating new resource:', {
          ...insertData,
          size_in_bytes: data.size_in_bytes || 0
        });

        const { error } = await supabase
          .from('hub_resources')
          .insert({
            ...insertData,
            size_in_bytes: data.size_in_bytes || 0,
            content_type: data.file_url ? 'application/pdf' : undefined,
            original_filename: data.file_url ? data.file_url.split('/').pop() : undefined,
            version: 1
          });

        if (error) throw error;
      }

      // Refresh hub metrics to update storage usage
      await supabase.rpc('refresh_hub_metrics', { _hub_id: hubId });

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
