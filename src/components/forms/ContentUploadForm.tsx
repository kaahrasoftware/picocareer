import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField, FormFieldProps } from "@/components/forms/FormField";
import { blogFormSchema, BlogFormValues } from "@/lib/validations/blog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContentUploadFormProps {
  onSubmit?: (data: BlogFormValues) => Promise<void>;
  fields: FormFieldProps[];
  buttonText?: string;
}

export function ContentUploadForm({ onSubmit, fields, buttonText = "Upload Career" }: ContentUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      summary: "",
      content: "",
      cover_image_url: "",
      categories: [],
      subcategories: [],
      other_notes: "",
      is_recent: false,
    },
  });

  const handleSubmit = async (data: BlogFormValues) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: result, error } = await supabase
          .from('blogs')
          .insert({
            title: data.title,
            summary: data.summary,
            content: data.content,
            cover_image_url: data.cover_image_url,
            categories: data.categories || [],
            subcategories: data.subcategories || [],
            other_notes: data.other_notes,
            is_recent: data.is_recent,
            author_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        const { error: notificationError } = await supabase.functions.invoke('send-blog-notifications', {
          body: { blogId: result.id }
        });

        if (notificationError) {
          console.error('Error sending notifications:', notificationError);
          toast({
            title: "Content Uploaded",
            description: "Content uploaded successfully, but there was an issue sending notifications.",
            variant: "default"
          });
        } else {
          toast({
            title: "Success",
            description: "Content uploaded successfully! Notifications have been sent.",
            variant: "default"
          });
        }

        // Reset the form after successful submission
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting content:', error);
      toast({
        title: "Error",
        description: "Failed to upload content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            label={field.label}
            placeholder={field.placeholder}
            description={field.description}
            type={field.type}
            required={field.required}
            options={field.options}
            dependsOn={field.dependsOn}
            watch={form.watch}
          />
        ))}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Uploading..." : buttonText}
        </Button>
      </form>
    </Form>
  );
}