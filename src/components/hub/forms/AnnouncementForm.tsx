
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";
import { FormField } from "@/components/forms/FormField";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { ImageUpload } from "@/components/forms/ImageUpload";

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
  image_url?: string;
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
      target_audience: existingAnnouncement?.target_audience || [],
      image_url: existingAnnouncement?.image_url || ""
    }
  });

  const onSubmit = async (data: FormFields) => {
    try {
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              label="Title"
              placeholder="Enter announcement title"
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Content</label>
              <RichTextEditor
                value={form.getValues("content")}
                onChange={(value) => form.setValue("content", value)}
                placeholder="Enter announcement content"
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              label="Attachment"
              type="image"
              bucket="announcement-images"
              description="Upload an image to attach to this announcement"
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

            <FormField
              control={form.control}
              name="scheduled_for"
              label="Schedule For"
              type="datetime-local"
            />

            <FormField
              control={form.control}
              name="expires_at"
              label="Expires At"
              type="datetime-local"
            />
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-4 mt-6">
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
