
// This file has been deprecated and replaced by EmailTemplateEditor.tsx
// It's kept for reference only and should not be used in new code.

import React, { useEffect } from "react";
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

interface ContentEditorTabProps {
  adminId: string;
  contentType: string;
  onContentUpdate: () => void;
}

// DEPRECATED: Use EmailTemplateEditor instead
export function ContentEditorTab({ adminId, contentType, onContentUpdate }: ContentEditorTabProps) {
  console.warn("ContentEditorTab is deprecated, use EmailTemplateEditor instead");
  
  const { register, handleSubmit, reset } = useForm<Omit<EmailTemplateContent, 'id' | 'admin_id' | 'content_type' | 'created_at' | 'updated_at'>>();

  const { data: content, isLoading } = useQuery({
    queryKey: ['email-template-content', contentType],
    queryFn: async () => {
      console.log("ContentEditorTab: Fetching content for", contentType, adminId);
      const { data, error } = await supabase
        .from('email_template_content')
        .select('*')
        .eq('content_type', contentType)
        .eq('admin_id', adminId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("ContentEditorTab fetch error:", error);
        throw error;
      }
      return data as EmailTemplateContent;
    },
  });

  // Use useEffect instead of onSuccess in useQuery
  useEffect(() => {
    if (content) {
      console.log("ContentEditorTab: Loaded content:", content);
      reset({
        header_text: content.header_text || '',
        intro_text: content.intro_text || '',
        cta_text: content.cta_text || '',
        footer_text: content.footer_text || '',
      });
    }
  }, [content, reset]);

  const onSubmit = async (formData: Omit<EmailTemplateContent, 'id' | 'admin_id' | 'content_type' | 'created_at' | 'updated_at'>) => {
    try {
      console.log("ContentEditorTab submitting with adminId:", adminId, "content type:", contentType);
      console.log("Form data:", formData);
      
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
        console.error("ContentEditorTab save error:", error);
        throw error;
      }
      
      toast.success("Template content updated successfully");
      onContentUpdate();
    } catch (error) {
      console.error('Error saving template content:', error);
      toast.error("Failed to save template content");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Return a div instead of a form
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="header_text">Header Text</Label>
          <Input
            id="header_text"
            {...register('header_text')}
            placeholder="Enter header text"
          />
        </div>

        <div>
          <Label htmlFor="intro_text">Introduction Text</Label>
          <Textarea
            id="intro_text"
            {...register('intro_text')}
            placeholder="Enter introduction text"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="cta_text">Call to Action Text</Label>
          <Input
            id="cta_text"
            {...register('cta_text')}
            placeholder="Enter call to action text"
          />
        </div>

        <div>
          <Label htmlFor="footer_text">Footer Text</Label>
          <Textarea
            id="footer_text"
            {...register('footer_text')}
            placeholder="Enter footer text"
            rows={3}
          />
        </div>
      </div>

      <Button onClick={handleSubmit(onSubmit)} className="w-full">
        Save Content
      </Button>
    </div>
  );
}
