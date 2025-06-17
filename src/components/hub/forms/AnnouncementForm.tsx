
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementFormProps {
  hubId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingAnnouncement?: any;
}

export function AnnouncementForm({ hubId, onSuccess, onCancel, existingAnnouncement }: AnnouncementFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: existingAnnouncement?.title || "",
    content: existingAnnouncement?.content || "",
    category: existingAnnouncement?.category || "general",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: existingAnnouncement ? "Announcement updated" : "Announcement created",
        description: `The announcement has been successfully ${existingAnnouncement ? "updated" : "created"}.`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the announcement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : existingAnnouncement ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
