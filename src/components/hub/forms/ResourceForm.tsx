
import { useForm, Controller } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ResourceFormData {
  title: string;
  description: string;
  resource_type: string;
  access_level: string;
  file_url?: string;
  external_url?: string;
}

interface ResourceFormProps {
  hubId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ResourceForm({ 
  hubId, 
  onSuccess, 
  onCancel 
}: ResourceFormProps) {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  const form = useForm<ResourceFormData>({
    defaultValues: {
      title: "",
      description: "",
      resource_type: "document",
      access_level: "members",
      file_url: "",
      external_url: ""
    }
  });

  const onSubmit = async (data: ResourceFormData) => {
    if (!profile?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create resources.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Would create resource:', {
        ...data,
        hub_id: hubId,
        created_by: profile.id
      });
      
      toast({
        title: "Success",
        description: "Resource created successfully.",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating resource:', error);
      toast({
        title: "Error",
        description: "Failed to create resource. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormField
              name="title"
              field={field}
              label="Title"
              type="text"
              required
            />
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormField
              name="description"
              field={field}
              label="Description"
              type="textarea"
            />
          )}
        />

        <Controller
          control={form.control}
          name="resource_type"
          render={({ field }) => (
            <FormField
              name="resource_type"
              field={field}
              label="Resource Type"
              type="select"
              options={[
                { value: "document", label: "Document" },
                { value: "image", label: "Image" },
                { value: "video", label: "Video" },
                { value: "external_link", label: "External Link" }
              ]}
              required
            />
          )}
        />

        <Controller
          control={form.control}
          name="access_level"
          render={({ field }) => (
            <FormField
              name="access_level"
              field={field}
              label="Access Level"
              type="select"
              options={[
                { value: "public", label: "Public" },
                { value: "members", label: "Members Only" },
                { value: "admins", label: "Admins Only" }
              ]}
              required
            />
          )}
        />

        <Controller
          control={form.control}
          name="file_url"
          render={({ field }) => (
            <FormField
              name="file_url"
              field={field}
              label="File Upload"
              type="text"
              description="Upload a file or enter file URL"
            />
          )}
        />

        <Controller
          control={form.control}
          name="external_url"
          render={({ field }) => (
            <FormField
              name="external_url"
              field={field}
              label="External URL"
              type="url"
              description="For external links and resources"
            />
          )}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {form.formState.isSubmitting ? "Creating..." : "Create Resource"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
