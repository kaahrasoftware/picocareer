
import React, { useState } from 'react';
import { Plus, Edit, Trash2, ExternalLink, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface MenteeProject {
  id: string;
  title: string;
  description?: string;
  project_type: string;
  start_date?: string;
  end_date?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  technologies_used?: string[];
  project_url?: string;
  repository_url?: string;
  created_at: string;
  updated_at: string;
}

interface MenteeProjectsTabProps {
  profileId: string;
  isEditing: boolean;
}

const statusColors = {
  planning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  on_hold: 'bg-gray-100 text-gray-800 border-gray-200'
};

export function MenteeProjectsTab({ profileId, isEditing }: MenteeProjectsTabProps) {
  const [projects] = useState<MenteeProject[]>([]);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Projects</h3>
        {isEditing && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            No projects added yet. {isEditing && "Click 'Add Project' to get started."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge className={statusColors[project.status]}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{project.project_type}</Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(project.start_date || project.end_date) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {project.start_date && format(new Date(project.start_date), 'MMM yyyy')}
                        {project.start_date && project.end_date && ' - '}
                        {project.end_date && format(new Date(project.end_date), 'MMM yyyy')}
                      </span>
                    </div>
                  )}
                  
                  {project.technologies_used && project.technologies_used.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies_used.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {project.project_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Project
                        </a>
                      </Button>
                    )}
                    {project.repository_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Repository
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
    </div>
  );
}
