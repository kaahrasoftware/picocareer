
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface MenteeProject {
  id: string;
  mentee_id: string;
  title: string;
  description?: string;
  technologies?: string[];
  github_url?: string;
  live_demo_url?: string;
  image_urls?: string[];
  status: 'completed' | 'in_progress' | 'planned';
  start_date?: string;
  end_date?: string;
  collaborators?: string[];
  skills_used?: string[];
  created_at: string;
  updated_at: string;
}

export interface MenteeProjectFormProps {
  menteeId: string;
  project?: MenteeProject;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MenteeProjectForm({ menteeId, project, onClose, onSuccess }: MenteeProjectFormProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    github_url: project?.github_url || '',
    live_demo_url: project?.live_demo_url || '',
    status: project?.status || 'completed' as const,
    start_date: project?.start_date || '',
    end_date: project?.end_date || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a project title.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData = {
        ...formData,
        mentee_id: menteeId,
        updated_at: new Date().toISOString()
      };

      if (project) {
        // Update existing project
        const { error } = await supabase
          .from('mentee_projects')
          .update(projectData)
          .eq('id', project.id);

        if (error) throw error;
      } else {
        // Create new project
        const { error } = await supabase
          .from('mentee_projects')
          .insert({
            ...projectData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Project ${project ? 'updated' : 'created'} successfully.`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: `Failed to ${project ? 'update' : 'create'} project.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Project Title
        </label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter project title..."
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your project..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="github_url" className="block text-sm font-medium mb-2">
            GitHub URL
          </label>
          <Input
            id="github_url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            placeholder="https://github.com/..."
          />
        </div>

        <div>
          <label htmlFor="live_demo_url" className="block text-sm font-medium mb-2">
            Live Demo URL
          </label>
          <Input
            id="live_demo_url"
            value={formData.live_demo_url}
            onChange={(e) => setFormData({ ...formData, live_demo_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : `${project ? 'Update' : 'Create'} Project`}
        </Button>
      </div>
    </div>
  );
}
