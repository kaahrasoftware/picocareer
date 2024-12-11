import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MentorFilters } from "./mentors/MentorFilters";
import { MentorResults } from "./mentors/MentorResults";
import { Mentor } from "@/types/mentor";

interface MentorListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentors: Mentor[];
}

export const MentorListDialog = ({ isOpen, onClose, mentors }: MentorListDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [educationFilter, setEducationFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [sessionFilter, setSessionFilter] = useState<string>("all");

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = 
      (mentor.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (mentor.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesCompany = companyFilter === "all" || mentor.company === companyFilter;
    const matchesEducation = educationFilter === "all" || mentor.education === educationFilter;
    const matchesExperience = experienceFilter === "all" || mentor.position?.includes(experienceFilter);
    const matchesSessions = sessionFilter === "all" || 
      (sessionFilter === "10+" ? parseInt(mentor.sessionsHeld || "0") >= 10 : 
       sessionFilter === "50+" ? parseInt(mentor.sessionsHeld || "0") >= 50 :
       sessionFilter === "100+" ? parseInt(mentor.sessionsHeld || "0") >= 100 : true);

    return matchesSearch && matchesCompany && matchesEducation && matchesExperience && matchesSessions;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Explore All Mentors</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <MentorFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            companyFilter={companyFilter}
            setCompanyFilter={setCompanyFilter}
            educationFilter={educationFilter}
            setEducationFilter={setEducationFilter}
            experienceFilter={experienceFilter}
            setExperienceFilter={setExperienceFilter}
            sessionFilter={sessionFilter}
            setSessionFilter={setSessionFilter}
          />
          
          <MentorResults mentors={filteredMentors} />
        </div>
      </DialogContent>
    </Dialog>
  );
};