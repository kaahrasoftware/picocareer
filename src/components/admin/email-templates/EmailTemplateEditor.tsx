
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { EmailTemplateContent } from "@/types/database/email";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";

interface EmailTemplateEditorProps {
  adminId: string;
  contentType: string;
  onContentUpdate?: () => void;
}

export function EmailTemplateEditor({ adminId, contentType, onContentUpdate }: EmailTemplateEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Omit<EmailTemplateContent, 'id' | 'admin_id' | 'content_type' | 'created_at' | 'updated_at'>>({
    defaultValues: {
      header_text: '',
      intro_text: '',
      cta_text: '',
      footer_text: '',
    }
  });

  const { data: content, isLoading } = useQuery({
    queryKey: ['email-template-content', contentType, adminId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_template_content')
        .select('*')
        .eq('content_type', contentType)
        .eq('admin_id', adminId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching template content:', error);
        throw error;
      }
      
      if (data) {
        // Update form values
        form.reset({
          header_text: data.header_text,
          intro_text: data.intro_text,
          cta_text: data.cta_text,
          footer_text: data.footer_text,
        });
      }
      
      return data as EmailTemplateContent;
    },
  });

  const onSubmit = async (formData: Omit<EmailTemplateContent, 'id' | 'admin_id' | 'content_type' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting email content with adminId:", adminId, "content type:", contentType);
      
      const { error } = await supabase
        .from('email_template_content')
        .upsert({
          content_type: contentType,
          admin_id: adminId,
          ...formData
        }, {
          onConflict: 'content_type,admin_id'
        });

      if (error) {
        console.error('Error saving template content:', error);
        throw error;
      }
      
      toast.success("Template content updated successfully");
      if (onContentUpdate) {
        onContentUpdate();
      }
    } catch (error) {
      console.error('Error saving template content:', error);
      toast.error("Failed to save template content");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="header_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Header Text</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter header text"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intro_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Introduction Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter introduction text"
                    rows={4}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cta_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call to Action Text</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter call to action text"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="footer_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Footer Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter footer text"
                    rows={3}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : "Save Content"}
        </Button>
      </form>
    </Form>
  );
}
