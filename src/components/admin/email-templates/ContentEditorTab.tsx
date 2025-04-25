
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ContentType } from "../email-campaign-form/utils";
import type { EmailTemplateContent } from "@/types/database/email";

interface ContentEditorTabProps {
  adminId: string;
  contentType: ContentType;
  onContentUpdate: () => void;
}

export function ContentEditorTab({ adminId, contentType, onContentUpdate }: ContentEditorTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing content
  const { data: templateContent, isLoading } = useQuery({
    queryKey: ['email-template-content', contentType, adminId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_template_content')
        .select('*')
        .eq('content_type', contentType)
        .eq('admin_id', adminId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as EmailTemplateContent;
    },
    meta: {
      onError: (error) => {
        console.error('Error fetching template content:', error);
      }
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EmailTemplateContent>({
    defaultValues: {
      content_type: contentType,
      admin_id: adminId,
      header_text: '',
      intro_text: '',
      cta_text: '',
      footer_text: ''
    }
  });

  // Update form with fetched data
  React.useEffect(() => {
    if (templateContent) {
      reset({
        content_type: templateContent.content_type,
        admin_id: templateContent.admin_id,
        header_text: templateContent.header_text || '',
        intro_text: templateContent.intro_text || '',
        cta_text: templateContent.cta_text || '',
        footer_text: templateContent.footer_text || ''
      });
    }
  }, [templateContent, reset]);

  // Save content
  const saveContent = async (data: Partial<EmailTemplateContent>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        content_type: contentType,
        admin_id: adminId
      };

      // Upsert content (create if not exists, update if exists)
      const { error } = await supabase
        .from('email_template_content')
        .upsert(payload, { 
          onConflict: 'admin_id,content_type',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      
      toast.success('Template content saved successfully');
      onContentUpdate(); // Notify parent to refresh preview
    } catch (error) {
      console.error('Error saving template content:', error);
      toast.error('Failed to save template content');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit(saveContent)} className="space-y-4">
        <div>
          <Label htmlFor="header_text">Header Text</Label>
          <Input
            id="header_text"
            {...register('header_text')}
            placeholder="e.g., Latest Blog Posts"
          />
        </div>
        
        <div>
          <Label htmlFor="intro_text">Introduction Text</Label>
          <Textarea
            id="intro_text"
            {...register('intro_text')}
            placeholder="Brief introduction to the email content"
            rows={4}
          />
        </div>
        
        <div>
          <Label htmlFor="cta_text">Call to Action Text</Label>
          <Input
            id="cta_text"
            {...register('cta_text')}
            placeholder="e.g., Read More"
          />
        </div>
        
        <div>
          <Label htmlFor="footer_text">Footer Text</Label>
          <Textarea
            id="footer_text"
            {...register('footer_text')}
            placeholder="Additional information or disclaimer text"
            rows={3}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : "Save Content"}
        </Button>
      </form>
    </Card>
  );
}
