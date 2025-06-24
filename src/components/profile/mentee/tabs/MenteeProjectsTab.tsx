import { useState } from "react";
import { Plus, Edit, Trash2, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMenteeProjects, useMenteeDataMutations } from "@/hooks/useMenteeData";
import { MenteeProjectForm } from "../forms/MenteeProjectForm";
import type { Profile } from "@/types/database/profiles";
import type { ProjectStatus, MenteeProject } from "@/types/mentee-profile";

interface MenteeProjectsTabProps {
  profile: Profile;
  isEditing: boolean;
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  planned: "bg-yellow-100 text-yellow-800",
  on_hold: "bg-red-100 text-red-800"
};

export function MenteeProjectsTab({ profile, isEditing }: MenteeProjectsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<MenteeProject | null>(null);
  
  const { data: projects = [], isLoading } = useMenteeProjects(profile.id);
  const { deleteProject } = useMenteeDataMutations();

  const handleEdit = (project: MenteeProject) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject.mutate(projectId);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Projects</h3>
        {isEditing && (
          <Button onClick={handleAddProject} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No projects added yet. {isEditing && "Click 'Add Project' to showcase your work."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <Badge className={STATUS_COLORS[project.status]}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-muted-foreground">{project.description}</p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Project Timeline */}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {project.start_date && (
                      <div>
                        <span className="font-medium">Started:</span> {new Date(project.start_date).toLocaleDateString()}
                      </div>
                    )}
                    {project.end_date && (
                      <div>
                        <span className="font-medium">Completed:</span> {new Date(project.end_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div>
                      <span className="font-medium text-sm">Technologies:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.technologies.map((tech, index) => (
                          <Badge key={index} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Used */}
                  {project.skills_used && project.skills_used.length > 0 && (
                    <div>
                      <span className="font-medium text-sm">Skills:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.skills_used.map((skill, index) => (
                          <Badge key={index} className="bg-blue-50 text-blue-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collaborators */}
                  {project.collaborators && project.collaborators.length > 0 && (
                    <div>
                      <span className="font-medium text-sm">Collaborators:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.collaborators.map((collaborator, index) => (
                          <Badge key={index} className="bg-green-50 text-green-700">
                            {collaborator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Links */}
                  <div className="flex gap-3">
                    {project.github_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {project.live_demo_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <MenteeProjectForm
          menteeId={profile?.id || ''}
          project={editingProject}
          onClose={() => {
            setShowForm(false);
            setEditingProject(undefined);
          }}
        />
      )}
    </div>
  );
}
