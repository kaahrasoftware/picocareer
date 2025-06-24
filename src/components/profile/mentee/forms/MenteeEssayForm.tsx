
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface MenteeEssayResponse {
  id: string;
  mentee_id: string;
  prompt_id: string;
  response_text?: string;
  word_count?: number;
  version: number;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenteeEssayFormProps {
  menteeId: string;
  essay?: MenteeEssayResponse;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MenteeEssayForm({ menteeId, essay, onClose, onSuccess }: MenteeEssayFormProps) {
  const [responseText, setResponseText] = useState(essay?.response_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!responseText.trim()) {
      toast({
        title: "Response required",
        description: "Please write a response before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const wordCount = responseText.trim().split(/\s+/).length;

      if (essay) {
        // Update existing essay
        const { error } = await supabase
          .from('mentee_essay_responses')
          .update({
            response_text: responseText,
            word_count: wordCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', essay.id);

        if (error) throw error;
      } else {
        // Create new essay - would need prompt_id from parent component
        toast({
          title: "Error",
          description: "Cannot create new essay without prompt selection.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Essay response saved successfully.",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving essay:', error);
      toast({
        title: "Error",
        description: "Failed to save essay response.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="response" className="block text-sm font-medium mb-2">
          Essay Response
        </label>
        <Textarea
          id="response"
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder="Write your essay response here..."
          rows={10}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Word count: {responseText.trim().split(/\s+/).filter(word => word.length > 0).length}
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Response"}
        </Button>
      </div>
    </div>
  );
}
