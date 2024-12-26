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
      (mentor.career_title?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
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
          {/* Make the filters sticky with a compact design */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 pb-4">
            <div className="transform transition-all duration-200 -mx-2">
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
            </div>
          </div>
          
          <MentorResults mentors={filteredMentors} />
        </div>
      </DialogContent>
    </Dialog>
  );
};