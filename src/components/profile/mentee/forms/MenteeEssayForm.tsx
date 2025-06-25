
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export interface MenteeEssayFormProps {
  menteeId: string;
  essay?: {
    id: string;
    prompt_id: string;
    response_text?: string;
    is_draft: boolean;
    word_count: number;
    version: number;
  };
  onClose: () => void;
}

export function MenteeEssayForm({ menteeId, essay, onClose }: MenteeEssayFormProps) {
  const [responseText, setResponseText] = useState(essay?.response_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Essay save logic would go here
      toast({
        title: "Success",
        description: "Essay saved successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save essay",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
        placeholder="Write your essay response..."
        rows={10}
      />
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
