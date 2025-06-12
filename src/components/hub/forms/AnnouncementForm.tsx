
import { useForm, Controller } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";

interface FormFields {
  title: string;
  content: string;
  category: string;
  cover_image_url?: string;
  expires_at?: string;
  scheduled_for?: string;
}

interface AnnouncementFormProps {
  hubId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AnnouncementForm({ 
  hubId, 
  onSuccess, 
  onCancel 
}: AnnouncementFormProps) {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  const form = useForm<FormFields>({
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      cover_image_url: "",
      expires_at: "",
      scheduled_for: ""
    }
  });

  const onSubmit = async (data: FormFields) => {
    if (!profile?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create announcements.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Would create announcement:', {
        ...data,
        hub_id: hubId,
        created_by: profile.id
      });
      
      toast({
        title: "Success",
        description: "Announcement created successfully.",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
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
              placeholder="Enter announcement title"
              required
            />
          )}
        />

        <Controller
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormField
              name="content"
              field={field}
              label="Content"
              type="textarea"
              placeholder="Enter announcement content"
              required
            />
          )}
        />

        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormField
              name="category"
              field={field}
              label="Category"
              type="select"
              options={[
                { value: "general", label: "General" },
                { value: "urgent", label: "Urgent" },
                { value: "event", label: "Event" },
                { value: "update", label: "Update" }
              ]}
              required
            />
          )}
        />

        <Controller
          control={form.control}
          name="cover_image_url"
          render={({ field }) => (
            <FormField
              name="cover_image_url"
              field={field}
              label="Cover Image"
              type="image"
              bucket="hub-images"
              accept="image/*"
            />
          )}
        />

        <Controller
          control={form.control}
          name="scheduled_for"
          render={({ field }) => (
            <FormField
              name="scheduled_for"
              field={field}
              label="Schedule For"
              type="text"
              placeholder="YYYY-MM-DD HH:MM (optional)"
              description="Leave empty to publish immediately"
            />
          )}
        />

        <Controller
          control={form.control}
          name="expires_at"
          render={({ field }) => (
            <FormField
              name="expires_at"
              field={field}
              label="Expires At"
              type="text"
              placeholder="YYYY-MM-DD HH:MM (optional)"
              description="Leave empty for no expiration"
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
            {form.formState.isSubmitting ? "Creating..." : "Create Announcement"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
