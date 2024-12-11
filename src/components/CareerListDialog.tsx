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
import { CareerCard } from "@/components/CareerCard";

interface Career {
  title: string;
  description: string;
  users: string;
  salary: string;
  imageUrl: string;
  relatedMajors: string[];
  relatedCareers: string[];
  skills: string[];
  category?: string;
  levelOfStudy?: string;
}

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
    const matchesStudyLevel = studyLevelFilter === "all" || career.levelOfStudy === studyLevelFilter;
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
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Search careers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>

            <Select value={salaryFilter} onValueChange={setSalaryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Salary Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranges</SelectItem>
                <SelectItem value="0-50K">$0 - $50K</SelectItem>
                <SelectItem value="50K-100K">$50K - $100K</SelectItem>
                <SelectItem value="100K+">$100K+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={studyLevelFilter} onValueChange={setStudyLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Level of Study" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high-school">High School</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="masters">Master's Degree</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by skills..."
              value={skillsFilter}
              onChange={(e) => setSkillsFilter(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map((career, index) => (
              <CareerCard key={index} {...career} />
            ))}
          </div>

          {filteredCareers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No careers found matching your filters.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};