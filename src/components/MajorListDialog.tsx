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
import type { Major } from "@/types/database/majors";

interface MajorListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  majors: Major[];
}

export const MajorListDialog = ({ isOpen, onClose, majors }: MajorListDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState<string>("all");
  const [gpaFilter, setGpaFilter] = useState<string>("all");
  const [degreeLevelFilter, setDegreeLevelFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("");

  const filteredMajors = majors.filter((major) => {
    const matchesSearch = major.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField = fieldFilter === "all" || (major.degree_levels || []).includes(fieldFilter);
    const matchesGPA = gpaFilter === "all" || (
      gpaFilter === "3.5+" ? (major.gpa_expectations || 0) >= 3.5 :
      gpaFilter === "3.0-3.5" ? (major.gpa_expectations || 0) >= 3.0 && (major.gpa_expectations || 0) < 3.5 :
      (major.gpa_expectations || 0) < 3.0
    );
    const matchesDegreeLevel = degreeLevelFilter === "all" || (major.degree_levels || []).includes(degreeLevelFilter);
    const matchesCourse = !courseFilter || (major.common_courses || []).some(course => 
      course.toLowerCase().includes(courseFilter.toLowerCase())
    );

    return matchesSearch && matchesField && matchesGPA && matchesDegreeLevel && matchesCourse;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
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
            
            <Select value={fieldFilter} onValueChange={setFieldFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Field of Study" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="STEM">STEM</SelectItem>
                <SelectItem value="Humanities">Humanities</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gpaFilter} onValueChange={setGpaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Average GPA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All GPAs</SelectItem>
                <SelectItem value="3.5+">3.5 and above</SelectItem>
                <SelectItem value="3.0-3.5">3.0 - 3.5</SelectItem>
                <SelectItem value="below-3.0">Below 3.0</SelectItem>
              </SelectContent>
            </Select>

            <Select value={degreeLevelFilter} onValueChange={setDegreeLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Degree Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Associate's">Associate's</SelectItem>
                <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                <SelectItem value="Master's">Master's</SelectItem>
                <SelectItem value="Doctorate">Doctorate</SelectItem>
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