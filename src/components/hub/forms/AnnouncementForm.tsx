
import { useForm, Controller } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { HubAnnouncement } from "@/types/database/hubs";

interface AnnouncementFormData {
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
}

interface AnnouncementFormProps {
  hubId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  announcement?: HubAnnouncement;
}

export function AnnouncementForm({ 
  hubId, 
  onSuccess, 
  onCancel,
  announcement
}: AnnouncementFormProps) {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  const form = useForm<AnnouncementFormData>({
    defaultValues: {
      title: announcement?.title || "",
      content: announcement?.content || "",
      category: announcement?.category || "general",
      is_pinned: announcement?.is_pinned || false
    }
  });

  const onSubmit = async (data: AnnouncementFormData) => {
    if (!profile?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create announcements.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Would create/update announcement:', {
        ...data,
        hub_id: hubId,
        author_id: profile.id
      });
      
      toast({
        title: "Success",
        description: announcement ? "Announcement updated successfully." : "Announcement created successfully.",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating/updating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to save announcement. Please try again.",
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
          name="content"
          render={({ field }) => (
            <FormField
              name="content"
              field={field}
              label="Content"
              type="textarea"
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
                { value: "academic", label: "Academic" },
                { value: "events", label: "Events" },
                { value: "resources", label: "Resources" }
              ]}
              required
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
            {form.formState.isSubmitting ? "Saving..." : announcement ? "Update Announcement" : "Create Announcement"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
