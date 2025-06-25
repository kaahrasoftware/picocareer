
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface MenteeEssayFormProps {
  menteeId: string;
  onClose: () => void;
}

export function MenteeEssayForm({ menteeId, onClose }: MenteeEssayFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    prompt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('mentee_essay_responses')
        .insert({
          mentee_id: menteeId,
          prompt_id: '00000000-0000-0000-0000-000000000000', // Default prompt ID
          response_text: formData.content,
          word_count: formData.content.split(' ').length,
          is_draft: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Essay saved successfully",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save essay",
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
          {isSubmitting ? "Saving..." : "Save Essay"}
        </Button>
      </div>
    </form>
  );
}
