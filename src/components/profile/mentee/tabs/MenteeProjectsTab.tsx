
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MenteeProjectForm } from "../forms/MenteeProjectForm";

interface MenteeProjectsTabProps {
  profileId: string;
}

export function MenteeProjectsTab({ profileId }: MenteeProjectsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProject(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Projects</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? 'Edit Project' : 'New Project'}
            </DialogTitle>
          </DialogHeader>
          <MenteeProjectForm
            menteeId={profileId}
            project={selectedProject}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Project list would go here */}
      <div className="text-center py-8 text-muted-foreground">
        <p>No projects yet. Click "Add Project" to get started.</p>
      </div>
    </div>
  );
}
