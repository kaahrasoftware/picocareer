import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MentorCard } from "@/components/MentorCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/integrations/supabase/types/user.types";

interface MentorListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentors: User[];
}

export function MentorListDialog({ isOpen, onClose, mentors: initialMentors }: MentorListDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedEducation, setSelectedEducation] = useState<string>("");

  const { data: filteredMentors } = useQuery({
    queryKey: ['mentors', searchQuery, selectedCompany, selectedEducation],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select('*')
        .eq('user_type', 'mentor');

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }

      if (selectedCompany) {
        query = query.eq('company', selectedCompany);
      }

      if (selectedEducation) {
        query = query.eq('education', selectedEducation);
      }

      const { data } = await query;

      if (!data) return [];

      return data.map(mentor => ({
        ...mentor,
        stats: typeof mentor.stats === 'string' 
          ? JSON.parse(mentor.stats)
          : mentor.stats
      }));
    },
    initialData: initialMentors,
  });

  // Get unique companies and education levels for filters
  const companies = [...new Set(initialMentors.map(mentor => mentor.company))];
  const educationLevels = [...new Set(initialMentors.filter(mentor => mentor.education).map(mentor => mentor.education as string))];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <div className="space-y-4 flex-1">
          <h2 className="text-2xl font-bold">Explore All Mentors</h2>
          
          <div className="flex gap-4">
            <Input
              placeholder="Search mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="border rounded-md px-3 py-2 bg-background"
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>

            <select
              value={selectedEducation}
              onChange={(e) => setSelectedEducation(e.target.value)}
              className="border rounded-md px-3 py-2 bg-background"
            >
              <option value="">All Education Levels</option>
              {educationLevels.map((education) => (
                <option key={education} value={education}>
                  {education}
                </option>
              ))}
            </select>
          </div>

          <ScrollArea className="flex-1 max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
              {filteredMentors?.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  {...mentor}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}