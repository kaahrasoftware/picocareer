
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormField } from "@/components/forms/FormField";
import { useState } from "react";

interface ResourceFormData {
  title: string;
  description: string;
  resource_type: "document" | "external_link" | "video" | "image";
  access_level: "public" | "admin" | "faculty" | "members";
  file_url?: string;
  external_url?: string;
}

interface ResourceFormProps {
  hubId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ResourceForm({ hubId, onSuccess, onCancel }: ResourceFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResourceFormData>({
    defaultValues: {
      title: "",
      description: "",
      resource_type: "document",
      access_level: "members",
      file_url: "",
      external_url: "",
    },
  });

  const onSubmit = async (data: ResourceFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create resources",
          variant: "destructive",
        });
        return;
      }

      const resourceData = {
        hub_id: hubId,
        title: data.title,
        description: data.description,
        resource_type: data.resource_type,
        access_level: data.access_level,
        file_url: data.file_url || "",
        external_url: data.external_url || "",
        created_by: user.id,
      };

      const { error } = await supabase
        .from('hub_resources')
        .insert(resourceData);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Resource created successfully",
      });

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating resource:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create resource",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resourceTypeOptions = [
    { id: "document", name: "Document" },
    { id: "external_link", name: "Link" },
    { id: "video", name: "Video" },
    { id: "image", name: "Image" },
  ];

  const accessLevelOptions = [
    { id: "members", name: "Members Only" },
    { id: "public", name: "Public" },
    { id: "admin", name: "Admin Only" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          label="Title"
          type="text"
          required
        />

        <FormField
          control={form.control}
          name="description"
          label="Description"
          type="textarea"
        />

        <FormField
          control={form.control}
          name="resource_type"
          label="Resource Type"
          type="select"
          options={resourceTypeOptions}
          required
        />

        <FormField
          control={form.control}
          name="access_level"
          label="Access Level"
          type="select"
          options={accessLevelOptions}
          required
        />

        <FormField
          control={form.control}
          name="file_url"
          label="File URL"
          type="text"
          description="Upload a file or provide a direct URL"
        />

        <FormField
          control={form.control}
          name="external_url"
          label="External URL"
          type="text"
          description="Link to external resource"
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Resource"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
