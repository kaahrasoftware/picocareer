
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { BasicInputField } from "@/components/forms/fields/BasicInputField";
import { supabase } from "@/integrations/supabase/client";
import { 
  ResourceAccessLevel, 
  HubResource,
  ResourceType,
  DocumentType 
} from "@/types/database/hubs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

const RESOURCE_TYPES = [
  { value: 'document', label: 'Document' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'external_link', label: 'External Link' }
];

const DOCUMENT_TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'word', label: 'Word Document' },
  { value: 'powerpoint', label: 'PowerPoint' },
  { value: 'excel', label: 'Excel' },
  { value: 'other', label: 'Other' }
];

const getAcceptedFileTypes = (resourceType: ResourceType, documentType?: DocumentType) => {
  switch (resourceType) {
    case 'document':
      switch (documentType) {
        case 'pdf':
          return '.pdf';
        case 'word':
          return '.doc,.docx';
        case 'powerpoint':
          return '.ppt,.pptx';
        case 'excel':
          return '.xls,.xlsx';
        default:
          return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
      }
    case 'image':
      return 'image/*';
    case 'video':
      return 'video/*';
    case 'audio':
      return 'audio/*';
    default:
      return undefined;
  }
};

const getUploadLabel = (resourceType: ResourceType) => {
  const type = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
  return `${type} File`;
};

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

      // Handle file upload if a file is selected and it's not an external link
      if (data.resource_type !== 'external_link' && data.file_url && data.file_url.startsWith('data:')) {
        const file = await fetch(data.file_url).then(r => r.blob());
        const fileExt = file.type.split('/')[1];
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(hubId)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(hubId)
          .getPublicUrl(fileName);

        file_url = publicUrl;
        content_type = file.type;
        original_filename = fileName;
      }

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
        <BasicInputField
          field={form.register("title")}
          label="Title"
          placeholder="Enter resource title"
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            {...form.register("description")}
            placeholder="Enter resource description"
            className="min-h-[100px]"
          />
        </div>

        <BasicInputField
          field={form.register("category")}
          label="Category"
          placeholder="Enter resource category"
        />

        <FormField
          control={form.control}
          name="resource_type"
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource Type</label>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        {resourceType === 'document' && (
          <FormField
            control={form.control}
            name="document_type"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        )}

        {resourceType === 'external_link' ? (
          <BasicInputField
            field={form.register("external_url")}
            label="External URL"
            placeholder="Enter external URL"
            required
          />
        ) : (
          <div className="space-y-2">
            <ImageUpload
              control={form.control}
              name="file_url"
              label={getUploadLabel(resourceType)}
              bucket={hubId}
              accept={getAcceptedFileTypes(resourceType, documentType)}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="access_level"
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Access Level</label>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="members">Members Only</SelectItem>
                  <SelectItem value="faculty">Faculty Only</SelectItem>
                  <SelectItem value="admin">Admin Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
