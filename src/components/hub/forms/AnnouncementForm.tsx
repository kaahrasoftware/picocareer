
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { CategorySelect } from "./announcement/CategorySelect";
import { ContentEditor } from "./announcement/ContentEditor";
import { useAnnouncementForm } from "./announcement/useAnnouncementForm";
import { AnnouncementFormProps } from "./announcement/types";

export function AnnouncementForm({ 
  hubId, 
  onSuccess,
  onCancel,
  existingAnnouncement 
}: AnnouncementFormProps) {
  const { form, onSubmit } = useAnnouncementForm({ 
    hubId, 
    onSuccess, 
    existingAnnouncement 
  });

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

            <ImageUpload
              control={form.control}
              name="cover_image_url"
              label="Cover Image"
              bucket="hub_resources"
              folderPath={`hubs/${hubId}/announcements`}
              accept="image/*"
              description="Upload a cover image for this announcement"
            />

            <ContentEditor
              value={form.watch("content")}
              onChange={(value) => form.setValue("content", value)}
              hubId={hubId}
            />

            <CategorySelect
              value={form.getValues("category")}
              onValueChange={(value) => form.setValue("category", value)}
            />

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
