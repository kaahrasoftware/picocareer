
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
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
import { useAuthSession } from "@/hooks/useAuthSession";

interface EmailTemplateEditorProps {
  adminId: string;
  contentType: string;
  onContentUpdate?: () => void;
}

export function EmailTemplateEditor({ adminId, contentType, onContentUpdate }: EmailTemplateEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session, isLoading: sessionLoading } = useAuthSession();

  // Verify if the user has permission to edit this template
  const hasPermission = session?.user?.id === adminId;

  // Define form with default values
  const form = useForm<Omit<EmailTemplateContent, 'id' | 'admin_id' | 'content_type' | 'created_at' | 'updated_at'>>({
    defaultValues: {
      header_text: '',
      intro_text: '',
      cta_text: '',
      footer_text: '',
    }
  });

  // Use useQuery to fetch existing content
  const { data: content, isLoading, error: fetchError } = useQuery({
    queryKey: ['email-template-content', contentType, adminId],
    queryFn: async () => {
      console.log(`Fetching template content for type: ${contentType}, adminId: ${adminId}`);
      const { data, error } = await supabase
        .from('email_template_content')
        .select('*')
        .eq('content_type', contentType)
        .eq('admin_id', adminId)
        .single();

      if (error) {
        console.error('Error fetching template content:', error);
        if (error.code !== 'PGRST116') { // Not found is okay
          throw error;
        }
      }
      
      if (data) {
        console.log('Found template content:', data);
      } else {
        console.log('No existing template content found, using defaults');
      }
      
      return data as EmailTemplateContent;
    },
  });

  // Update form values when content is fetched
  useEffect(() => {
    if (content) {
      form.reset({
        header_text: content.header_text || '',
        intro_text: content.intro_text || '',
        cta_text: content.cta_text || '',
        footer_text: content.footer_text || '',
      });
    }
  }, [content, form]);

  // Form submission handler
  const onSubmit = async (formData: Omit<EmailTemplateContent, 'id' | 'admin_id' | 'content_type' | 'created_at' | 'updated_at'>) => {
    if (!adminId || sessionLoading) {
      toast.error("Authentication issue. Please try again.");
      return;
    }
    
    if (!hasPermission) {
      toast.error("You don't have permission to edit this template");
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting template content with: ", {
      adminId,
      contentType,
      formData
    });
    
    try {
      // Check for authentication
      if (!session?.user) {
        throw new Error("You must be logged in to save templates");
      }
      
      // Create the data object
      const templateData = {
        content_type: contentType,
        admin_id: adminId,
        ...formData
      };
      
      console.log("Saving with data:", templateData);
      
      const { data, error } = await supabase
        .from('email_template_content')
        .upsert(templateData, {
          onConflict: 'content_type,admin_id'
        });

      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      console.log("Save successful, response:", data);
      toast.success("Template content updated successfully");
      
      if (onContentUpdate) {
        onContentUpdate();
      }
    } catch (error) {
      console.error('Error saving template content:', error);
      toast.error(`Failed to save template content: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  if (fetchError) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h3 className="text-red-600 font-medium">Error loading template</h3>
        <p className="text-sm text-red-500">
          {fetchError instanceof Error ? fetchError.message : "Failed to load template content"}
        </p>
        <Button 
          variant="outline"
          className="mt-2" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
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

        <div className="space-y-2">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Content"}
          </Button>
          
          {!hasPermission && (
            <p className="text-sm text-red-500 text-center">
              Warning: You don't have permission to edit this template
            </p>
          )}
          
          <div className="text-xs text-gray-500 mt-2">
            <p>Form state: {form.formState.isDirty ? 'Changed' : 'Unchanged'}</p>
            <p>adminId: {adminId}</p>
            <p>contentType: {contentType}</p>
            {session ? (
              <p>Logged in as: {session.user.email}</p>
            ) : (
              <p className="text-red-500">Not logged in</p>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
