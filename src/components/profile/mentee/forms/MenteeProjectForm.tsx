
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MenteeProjectFormProps {
  menteeId: string;
  onClose: () => void;
}

export function MenteeProjectForm({ menteeId, onClose }: MenteeProjectFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'completed' as const,
    technologies: '',
    skills_used: '',
    github_url: '',
    live_demo_url: '',
    start_date: '',
    end_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('mentee_projects')
        .insert({
          mentee_id: menteeId,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          technologies: formData.technologies ? formData.technologies.split(',').map(t => t.trim()) : [],
          skills_used: formData.skills_used ? formData.skills_used.split(',').map(s => s.trim()) : [],
          github_url: formData.github_url || null,
          live_demo_url: formData.live_demo_url || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project saved successfully",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter project title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your project..."
          className="min-h-[100px]"
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="technologies">Technologies (comma-separated)</Label>
        <Input
          id="technologies"
          value={formData.technologies}
          onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
          placeholder="React, Node.js, PostgreSQL..."
        />
      </div>

      <div>
        <Label htmlFor="skills_used">Skills Used (comma-separated)</Label>
        <Input
          id="skills_used"
          value={formData.skills_used}
          onChange={(e) => setFormData({ ...formData, skills_used: e.target.value })}
          placeholder="Frontend Development, API Design..."
        />
      </div>

      <div>
        <Label htmlFor="github_url">GitHub URL</Label>
        <Input
          id="github_url"
          type="url"
          value={formData.github_url}
          onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
          placeholder="https://github.com/username/project"
        />
      </div>

      <div>
        <Label htmlFor="live_demo_url">Live Demo URL</Label>
        <Input
          id="live_demo_url"
          type="url"
          value={formData.live_demo_url}
          onChange={(e) => setFormData({ ...formData, live_demo_url: e.target.value })}
          placeholder="https://yourproject.com"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Project"}
        </Button>
      </div>
    </form>
  );
}
