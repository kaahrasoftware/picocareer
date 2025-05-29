
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BasicInputField } from "@/components/forms/fields/BasicInputField";
import { supabase } from "@/integrations/supabase/client";
import { 
  AnnouncementCategory,
  InstitutionAnnouncement 
} from "@/types/database/institutions";

interface AnnouncementFormProps {
  institutionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingAnnouncement?: InstitutionAnnouncement;
}

interface FormFields {
  title: string;
  content: string;
  category: AnnouncementCategory;
  scheduled_for?: string;
  expires_at?: string;
  target_audience?: string[];
}

export function AnnouncementForm({ 
  institutionId, 
  onSuccess,
  onCancel,
  existingAnnouncement 
}: AnnouncementFormProps) {
  const { toast } = useToast();

  const form = useForm<FormFields>({
    defaultValues: {
      title: existingAnnouncement?.title || "",
      content: existingAnnouncement?.content || "",
      category: existingAnnouncement?.category || "general",
      scheduled_for: existingAnnouncement?.scheduled_for || "",
      expires_at: existingAnnouncement?.expires_at || "",
      target_audience: existingAnnouncement?.target_audience || []
    }
  });

  const onSubmit = async (data: FormFields) => {
    try {
      if (existingAnnouncement) {
        const { error } = await supabase
          .from('institution_announcements')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAnnouncement.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('institution_announcements')
          .insert({
            ...data,
            institution_id: institutionId,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Announcement ${existingAnnouncement ? 'updated' : 'created'} successfully.`
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving announcement:', error);
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
        <BasicInputField
          field={form.register("title")}
          label="Title"
          placeholder="Enter announcement title"
          required
        />

        <BasicInputField
          field={form.register("content")}
          label="Content"
          placeholder="Enter announcement content"
          required
        />

        <BasicInputField
          field={form.register("category")}
          label="Category"
          placeholder="Select category"
          required
        />

        <BasicInputField
          field={form.register("scheduled_for")}
          label="Schedule For"
          type="datetime-local"
        />

        <BasicInputField
          field={form.register("expires_at")}
          label="Expires At"
          type="datetime-local"
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {form.formState.isSubmitting ? "Saving..." : "Save Announcement"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
