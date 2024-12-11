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
import { MajorCard } from "@/components/MajorCard";
import { Major } from "@/integrations/supabase/types/major.types";

interface MajorListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  majors: Major[];
}

export const MajorListDialog = ({ isOpen, onClose, majors }: MajorListDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [studyLevelFilter, setStudyLevelFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [gpaFilter, setGpaFilter] = useState<string>("all");

  const filteredMajors = majors.filter((major) => {
    const matchesSearch = major.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || major.category === categoryFilter;
    const matchesStudyLevel = studyLevelFilter === "all" || major.level_of_study === studyLevelFilter;
    const matchesCourses = !courseFilter || major.required_courses.some(course => 
      course.toLowerCase().includes(courseFilter.toLowerCase())
    );
    const matchesGPA = gpaFilter === "all" || (
      gpaFilter === "3.5+" ? parseFloat(major.average_gpa) >= 3.5 :
      gpaFilter === "3.0-3.49" ? parseFloat(major.average_gpa) >= 3.0 && parseFloat(major.average_gpa) < 3.5 :
      gpaFilter === "2.5-2.99" ? parseFloat(major.average_gpa) >= 2.5 && parseFloat(major.average_gpa) < 3.0 :
      parseFloat(major.average_gpa) < 2.5
    );

    return matchesSearch && matchesCategory && matchesStudyLevel && matchesCourses && matchesGPA;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Explore All Majors</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Search majors..."
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
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="arts">Arts & Humanities</SelectItem>
              </SelectContent>
            </Select>

            <Select value={studyLevelFilter} onValueChange={setStudyLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Level of Study" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
                <SelectItem value="doctorate">Doctorate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gpaFilter} onValueChange={setGpaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Average GPA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All GPAs</SelectItem>
                <SelectItem value="3.5+">3.5 or higher</SelectItem>
                <SelectItem value="3.0-3.49">3.0 - 3.49</SelectItem>
                <SelectItem value="2.5-2.99">2.5 - 2.99</SelectItem>
                <SelectItem value="below-2.5">Below 2.5</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by required courses..."
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMajors.map((major) => (
              <MajorCard key={major.id} {...major} />
            ))}
          </div>

          {filteredMajors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No majors found matching your filters.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};