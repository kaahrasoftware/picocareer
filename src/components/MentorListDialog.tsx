import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MentorCard } from "@/components/MentorCard";

interface Mentor {
  title: string;
  company: string;
  imageUrl: string;
  name: string;
  stats: {
    mentees: string;
    connected: string;
    recordings: string;
  };
  username: string;
  education?: string;
  sessionsHeld?: string;
  position?: string;
}

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
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase());
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
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Search mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                <SelectItem value="Microsoft Inc.">Microsoft</SelectItem>
                <SelectItem value="Lenovo">Lenovo</SelectItem>
                <SelectItem value="Georgia Tech">Georgia Tech</SelectItem>
                <SelectItem value="Walmart">Walmart</SelectItem>
              </SelectContent>
            </Select>

            <Select value={educationFilter} onValueChange={setEducationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Education" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Education Levels</SelectItem>
                <SelectItem value="Bachelor's">Bachelor's Degree</SelectItem>
                <SelectItem value="Master's">Master's Degree</SelectItem>
                <SelectItem value="PhD">PhD</SelectItem>
              </SelectContent>
            </Select>

            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Experience Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Principal">Principal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sessionFilter} onValueChange={setSessionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sessions Held" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="10+">10+ Sessions</SelectItem>
                <SelectItem value="50+">50+ Sessions</SelectItem>
                <SelectItem value="100+">100+ Sessions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor, index) => (
              <MentorCard key={index} {...mentor} />
            ))}
          </div>

          {filteredMentors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No mentors found matching your filters.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};