import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MenteeEssayResponse } from '@/types/profile/types';

interface MenteeEssayFormProps {
  menteeId: string;
  essay?: MenteeEssayResponse;
  onClose: () => void;
}

export function MenteeEssayForm({ menteeId, essay, onClose }: MenteeEssayFormProps) {
  const [title, setTitle] = useState(essay?.title || "");
  const [content, setContent] = useState(essay?.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const essayData = {
        mentee_id: menteeId,
        title: title.trim(),
        content: content.trim(),
      };

      let query = supabase.from('mentee_essays');
      if (essay?.id) {
        query = query.update(essayData).eq('id', essay.id);
      } else {
        query = query.insert(essayData);
      }

      const { data, error } = await query.select().single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Essay ${essay ? 'updated' : 'created'} successfully!`,
      });
      onClose();
    } catch (error: any) {
      console.error("Error saving essay:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save essay. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{essay ? "Edit Essay" : "Add New Essay"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Essay Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Textarea
              placeholder="Essay Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
