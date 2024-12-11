import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Career } from "@/integrations/supabase/types/career.types";
import { CareerFilters } from "./careers/CareerFilters";
import { CareerResults } from "./careers/CareerResults";

interface CareerListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  careers: Career[];
}

export const CareerListDialog = ({ isOpen, onClose, careers }: CareerListDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [salaryFilter, setSalaryFilter] = useState<string>("all");
  const [studyLevelFilter, setStudyLevelFilter] = useState<string>("all");
  const [skillsFilter, setSkillsFilter] = useState<string>("");

  const filteredCareers = careers.filter((career) => {
    const matchesSearch = career.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || career.category === categoryFilter;
    const matchesSalary = salaryFilter === "all" || career.salary.includes(salaryFilter);
    const matchesStudyLevel = studyLevelFilter === "all" || career.level_of_study === studyLevelFilter;
    const matchesSkills = !skillsFilter || career.skills.some(skill => 
      skill.toLowerCase().includes(skillsFilter.toLowerCase())
    );

    return matchesSearch && matchesCategory && matchesSalary && matchesStudyLevel && matchesSkills;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Explore All Careers</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <CareerFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            salaryFilter={salaryFilter}
            setSalaryFilter={setSalaryFilter}
            studyLevelFilter={studyLevelFilter}
            setStudyLevelFilter={setStudyLevelFilter}
            skillsFilter={skillsFilter}
            setSkillsFilter={setSkillsFilter}
          />
          
          <CareerResults careers={filteredCareers} />
        </div>
      </DialogContent>
    </Dialog>
  );
};