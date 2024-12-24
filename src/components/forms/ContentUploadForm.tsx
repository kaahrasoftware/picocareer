import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { blogFormFields } from "./blog/BlogFormFields";
import { blogFormSchema } from "@/lib/validations/blog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function ContentUploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm({
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

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('blogs')
        .insert([
          {
            ...data,
            author_id: user.id,
            categories: data.categories || [],
            subcategories: data.subcategories || [],
          }
        ])
        .select();

      if (error) throw error;

      // After successful blog submission, send notifications
      const { error: notificationError } = await supabase.functions.invoke('send-blog-notifications', {
        body: { blogId: result[0].id }
      });

      if (notificationError) {
        console.error('Error sending notifications:', notificationError);
        toast({
          title: "Blog Posted",
          description: "Blog posted successfully, but there was an issue sending notifications.",
          variant: "default"
        });
      } else {
        toast({
          title: "Blog Posted",
          description: "Blog posted successfully! Notifications have been sent.",
          variant: "default"
        });
      }

      form.reset();
      navigate('/blog');
    } catch (error) {
      console.error('Error submitting blog:', error);
      toast({
        title: "Error",
        description: "Failed to post blog. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {blogFormFields.map((field) => (
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : "Upload Blog Post"}
        </Button>
      </form>
    </Form>
  );
}