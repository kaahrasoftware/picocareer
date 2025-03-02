
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
  const fileUrl = form.watch('file_url');

  const getFileSizeFromUrl = async (url: string): Promise<number> => {
    if (!url) return 0;
    
    try {
      // Attempt to get file metadata if possible
      const path = url.split('/').slice(-4).join('/');
      const { data, error } = await supabase.storage
        .from('hub_resources')
        .getPublicUrl(path);
      
      if (error) {
        console.error('Error getting file metadata:', error);
        return 0;
      }
      
      // If we can't get size from metadata, make a HEAD request
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          return parseInt(contentLength, 10);
        }
      } catch (headError) {
        console.warn('Error getting file size via HEAD request:', headError);
      }
      
      // As a fallback, estimate size based on resource type
      if (resourceType === 'image') return 500000; // 500KB
      if (resourceType === 'video') return 5000000; // 5MB
      if (resourceType === 'audio') return 2000000; // 2MB
      if (resourceType === 'document') return 1000000; // 1MB
      
      return 100000; // Default 100KB
    } catch (error) {
      console.error('Error determining file size:', error);
      return 0;
    }
  };

  const onSubmit = async (data: FormFields) => {
    try {
      const user = await supabase.auth.getUser();
      
      // Get file size for the uploaded file
      let fileSizeInBytes = 0;
      if (data.file_url) {
        fileSizeInBytes = await getFileSizeFromUrl(data.file_url);
      }
      
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
            access_level: data.access_level,
            size_in_bytes: fileSizeInBytes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResource.id);

        if (error) throw error;
      } else {
        console.log('Creating new resource with file size:', fileSizeInBytes);

        const { error } = await supabase
          .from('hub_resources')
          .insert({
            hub_id: hubId,
            title: data.title,
            description: data.description,
            category: data.category,
            resource_type: data.resource_type,
            document_type: data.document_type,
            external_url: data.external_url,
            file_url: data.file_url,
            access_level: data.access_level,
            content_type: data.file_url ? 'application/octet-stream' : undefined,
            original_filename: data.file_url ? data.file_url.split('/').pop() : undefined,
            size_in_bytes: fileSizeInBytes,
            version: 1,
            created_by: user.data.user?.id,
          });

        if (error) throw error;
      }

      // Update hub storage metrics after resource change
      await updateHubStorageUsage(hubId);

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

  const updateHubStorageUsage = async (hubId: string) => {
    try {
      await supabase.rpc('refresh_hub_metrics', { _hub_id: hubId });
    } catch (error) {
      console.error('Error updating hub storage usage:', error);
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
