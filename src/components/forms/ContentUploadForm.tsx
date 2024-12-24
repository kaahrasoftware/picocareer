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

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Convert array fields from comma-separated strings to actual arrays
        const formattedData = {
          ...data,
          academic_majors: data.academic_majors?.split(',').map((item: string) => item.trim()) || [],
          required_skills: data.required_skills?.split(',').map((item: string) => item.trim()) || [],
          required_tools: data.required_tools?.split(',').map((item: string) => item.trim()) || [],
          keywords: data.keywords?.split(',').map((item: string) => item.trim()) || [],
          transferable_skills: data.transferable_skills?.split(',').map((item: string) => item.trim()) || [],
          careers_to_consider_switching_to: data.careers_to_consider_switching_to?.split(',').map((item: string) => item.trim()) || [],
          required_education: data.required_education?.split(',').map((item: string) => item.trim()) || [],
        };

        const { error } = await supabase
          .from('careers')
          .insert({
            ...formattedData,
            status: 'Pending',
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Career uploaded successfully! It will be reviewed before being published.",
          variant: "default"
        });

        // Reset the form after successful submission
        form.reset();
      }
    } catch (error: any) {
      console.error('Error submitting content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload content. Please try again.",
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