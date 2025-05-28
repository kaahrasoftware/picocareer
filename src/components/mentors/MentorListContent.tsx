
import { useState } from "react";
import { MentorFilters } from "./MentorFilters";
import { MentorResults } from "./MentorResults";
import type { Mentor } from "@/types/mentor";

interface MentorListContentProps {
  mentors?: Mentor[];
}

export function MentorListContent({ mentors = [] }: MentorListContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [educationFilter, setEducationFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [sessionFilter, setSessionFilter] = useState<string>("all");

  // Early return if mentors is not available
  if (!Array.isArray(mentors)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
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
  );
}
