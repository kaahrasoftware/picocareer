
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { MenteeEssay } from "@/types/database/mentees";

interface FormFields {
  prompt_id: string;
  response_text: string;
  is_draft: boolean;
}

interface MenteeEssayFormProps {
  menteeId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingEssay?: MenteeEssay;
}

export function MenteeEssayForm({ 
  menteeId, 
  onSuccess, 
  onCancel,
  existingEssay
}: MenteeEssayFormProps) {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  const form = useForm<FormFields>({
    defaultValues: {
      prompt_id: existingEssay?.prompt_id || "",
      response_text: existingEssay?.response_text || "",
      is_draft: existingEssay?.is_draft ?? false
    }
  });

  const onSubmit = async (data: FormFields) => {
    if (!profile?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create essays.",
        variant: "destructive",
      });
      return;
    }

    if (!data.prompt_id) {
      toast({
        title: "Validation Error",
        description: "Please select a prompt.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = {
        mentee_id: menteeId,
        prompt_id: data.prompt_id,
        response_text: data.response_text || '',
        is_draft: data.is_draft,
        word_count: data.response_text?.split(' ').length || 0,
        version: 1
      };

      const { data: essayData, error } = await supabase
        .from('mentee_essays')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Essay created successfully.",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error with essay:', error);
      toast({
        title: "Error",
        description: "Failed to create essay. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          control={form.control}
          name="prompt_id"
          rules={{ required: "Prompt is required" }}
          render={({ field }) => (
            <FormField
              name="prompt_id"
              field={field}
              label="Prompt ID"
              type="text"
              placeholder="Enter prompt ID"
              required
            />
          )}
        />

        <Controller
          control={form.control}
          name="response_text"
          render={({ field }) => (
            <FormField
              name="response_text"
              field={field}
              label="Response Text"
              type="textarea"
              placeholder="Enter response text"
              required
            />
          )}
        />

        <Controller
          control={form.control}
          name="is_draft"
          render={({ field }) => (
            <FormField
              name="is_draft"
              field={field}
              label="Is Draft"
              type="checkbox"
            />
          )}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {form.formState.isSubmitting ? 'Creating...' : 'Create Essay'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
