
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MenteeEssayResponse {
  id: string;
  prompt_id: string;
  response_text: string;
  word_count: number;
  is_draft: boolean;
}

export interface MenteeEssayFormProps {
  menteeId: string;
  onClose: () => void;
  essay?: MenteeEssayResponse;
}

export function MenteeEssayForm({ menteeId, onClose, essay }: MenteeEssayFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: essay?.response_text || '',
    prompt: ''
  });

  useEffect(() => {
    if (essay) {
      setFormData({
        title: '',
        content: essay.response_text || '',
        prompt: ''
      });
    }
  }, [essay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (essay) {
        // Update existing essay
        const { error } = await supabase
          .from('mentee_essay_responses')
          .update({
            response_text: formData.content,
            word_count: formData.content.split(' ').length,
            is_draft: false
          })
          .eq('id', essay.id);

        if (error) throw error;
      } else {
        // Create new essay
        const { error } = await supabase
          .from('mentee_essay_responses')
          .insert({
            mentee_id: menteeId,
            prompt_id: '00000000-0000-0000-0000-000000000000',
            response_text: formData.content,
            word_count: formData.content.split(' ').length,
            is_draft: false
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Essay ${essay ? 'updated' : 'saved'} successfully`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${essay ? 'update' : 'save'} essay`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Essay title"
        />
      </div>

      <div>
        <Label htmlFor="prompt">Prompt</Label>
        <Input
          id="prompt"
          value={formData.prompt}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          placeholder="Essay prompt or question"
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your essay here..."
          className="min-h-[200px]"
          required
        />
        <p className="text-sm text-muted-foreground mt-1">
          Word count: {formData.content.split(' ').filter(word => word.length > 0).length}
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? `${essay ? 'Updating' : 'Saving'}...` : `${essay ? 'Update' : 'Save'} Essay`}
        </Button>
      </div>
    </form>
  );
}
