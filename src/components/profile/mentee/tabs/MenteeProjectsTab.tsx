import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MenteeProject } from "@/types/database/mentees";
import { useAuthSession } from "@/hooks/useAuthSession";

interface MenteeProjectsTabProps {
  profileId: string;
}

export function MenteeProjectsTab({ profileId }: MenteeProjectsTabProps) {
  const [projects, setProjects] = useState<MenteeProject[]>([]);
  const [newProject, setNewProject] = useState<Partial<MenteeProject>>({});
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { session } = useAuthSession();

  useEffect(() => {
    fetchProjects();
  }, [profileId]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mentee_projects')
        .select('*')
        .eq('mentee_id', profileId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async (project: Partial<MenteeProject>) => {
    try {
      const projectData = {
        mentee_id: profileId,
        title: project.title!,
        description: project.description || '',
        status: project.status || 'completed' as const,
        start_date: project.start_date,
        end_date: project.end_date,
        github_url: project.github_url,
        live_demo_url: project.live_demo_url,
        image_urls: project.image_urls || [],
        collaborators: project.collaborators || [],
        skills_used: project.skills_used || [],
        technologies: project.technologies || []
      };

      let response;
      if (project.id) {
        // Update existing project
        const { data, error } = await supabase
          .from('mentee_projects')
          .update(projectData)
          .eq('id', project.id)
          .select('*')
          .single();
        
        if (error) {
          console.error('Error updating project:', error);
          toast({
            title: "Error",
            description: "Failed to update project",
            variant: "destructive",
          });
          return;
        }
        response = data;
        setProjects(projects.map(p => (p.id === project.id ? { ...p, ...projectData } : p)));
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('mentee_projects')
          .insert(projectData)
          .select('*')
          .single();

        if (error) {
          console.error('Error creating project:', error);
          toast({
            title: "Error",
            description: "Failed to create project",
            variant: "destructive",
          });
          return;
        }
        response = data;
        setProjects([response, ...projects]);
      }

      toast({
        title: "Success",
        description: project.id ? "Project updated successfully" : "Project created successfully",
      });

      setNewProject({});
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mentee_projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive",
        });
        return;
      }

      setProjects(projects.filter(project => project.id !== id));
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (id: string) => {
    setEditingProject(id);
    const projectToEdit = projects.find(project => project.id === id);
    if (projectToEdit) {
      setNewProject(projectToEdit);
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setNewProject({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Project Form */}
        <div className="border rounded-md p-4">
          <h4 className="text-sm font-medium mb-2">{editingProject ? 'Edit Project' : 'Add New Project'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                value={newProject.title || ''}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                type="url"
                id="github_url"
                value={newProject.github_url || ''}
                onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="live_demo_url">Live Demo URL</Label>
              <Input
                type="url"
                id="live_demo_url"
                value={newProject.live_demo_url || ''}
                onChange={(e) => setNewProject({ ...newProject, live_demo_url: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newProject.description || ''}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            {editingProject && (
              <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button type="button" onClick={() => handleSaveProject(newProject)}>
              <Save className="h-4 w-4 mr-2" />
              {editingProject ? 'Update Project' : 'Save Project'}
            </Button>
          </div>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="text-center py-4">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-4">No projects added yet.</div>
        ) : (
          <ScrollArea className="rounded-md border h-[300px] p-4">
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium">{project.title}</h5>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(project.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 underline block mt-2"
                    >
                      GitHub
                    </a>
                  )}
                  {project.live_demo_url && (
                    <a
                      href={project.live_demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 underline block mt-1"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
