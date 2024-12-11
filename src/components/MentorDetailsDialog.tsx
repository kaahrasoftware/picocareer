import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MentorHeader } from "./mentor/MentorHeader";
import { MentorInfo } from "./mentor/MentorInfo";
import { MentorBio } from "./mentor/MentorBio";
import { MentorSkills } from "./mentor/MentorSkills";
import { MentorStats } from "./mentor/MentorStats";
import { MentorActions } from "./mentor/MentorActions";
import { User } from "@/integrations/supabase/types";

interface MentorDetailsDialogProps {
  mentor: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MentorDetailsDialog({
  mentor,
  open,
  onOpenChange,
}: MentorDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-kahra-darker text-white overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Mentor Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <MentorHeader
            name={mentor.name}
            imageUrl={mentor.image_url}
          />

          <MentorInfo
            title={mentor.title}
            company={mentor.company}
            position={mentor.position}
            education={mentor.education}
          />

          <MentorBio bio={mentor.bio} />

          <MentorSkills
            skills={mentor.skills}
            tools={mentor.tools}
            keywords={mentor.keywords}
          />

          <MentorStats stats={mentor.stats} />

          <MentorActions mentor={mentor} />
        </div>
      </DialogContent>
    </Dialog>
  );
}