
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BasicInputField } from "@/components/forms/fields/BasicInputField";

interface AnnouncementFormProps {
  institutionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormFields {
  title: string;
  content: string;
  category: string;
}

export function AnnouncementForm({ 
  institutionId, 
  onSuccess,
  onCancel
}: AnnouncementFormProps) {
  const { toast } = useToast();

  const form = useForm<FormFields>({
    defaultValues: {
      title: "",
      content: "",
      category: "general"
    }
  });

  const onSubmit = async (data: FormFields) => {
    try {
      // Since institution_announcements table doesn't exist, show placeholder behavior
      console.log('Would create announcement:', data);
      
      toast({
        title: "Feature Coming Soon",
        description: "Institution announcements will be available in a future update.",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error in announcement form:', error);
      toast({
        title: "Error",
        description: "This feature is not yet implemented.",
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
