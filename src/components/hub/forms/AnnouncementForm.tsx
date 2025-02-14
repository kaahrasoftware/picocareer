
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BasicInputField } from "@/components/forms/fields/BasicInputField";
import { supabase } from "@/integrations/supabase/client";
import { 
  AnnouncementCategory,
  HubAnnouncement 
} from "@/types/database/hubs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface AnnouncementFormProps {
  hubId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingAnnouncement?: HubAnnouncement;
}

interface FormFields {
  title: string;
  content: string;
  category: AnnouncementCategory;
  scheduled_for?: string;
  expires_at?: string;
  target_audience?: string[];
}

const CATEGORY_OPTIONS: AnnouncementCategory[] = ['event', 'news', 'alert', 'general'];

export function AnnouncementForm({ 
  hubId, 
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
      // Clean timestamp fields - convert empty strings to null
      const cleanedData = {
        ...data,
        scheduled_for: data.scheduled_for?.trim() || null,
        expires_at: data.expires_at?.trim() || null
      };

      if (existingAnnouncement) {
        const { error } = await supabase
          .from('hub_announcements')
          .update({
            ...cleanedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAnnouncement.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hub_announcements')
          .insert({
            ...cleanedData,
            hub_id: hubId,
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

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Category</label>
          <Select
            value={form.getValues("category")}
            onValueChange={(value: AnnouncementCategory) => form.setValue("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
