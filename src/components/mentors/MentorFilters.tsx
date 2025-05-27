
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, 
  Briefcase, 
  Building, 
  Calendar, 
  Filter, 
  GraduationCap, 
  MessageSquare, 
  Star,
  ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAllCompanies, useAllMajors, useAllSchools } from "@/hooks/useAllReferenceData";

interface MentorFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  educationFilter: string;
  setEducationFilter: (value: string) => void;
  experienceFilter: string;
  setExperienceFilter: (value: string) => void;
  sessionFilter: string;
  setSessionFilter: (value: string) => void;
  majorFilter?: string;
  setMajorFilter?: (value: string) => void;
  schoolFilter?: string;
  setSchoolFilter?: (value: string) => void;
  ratingFilter?: string;
  setRatingFilter?: (value: string) => void;
  availabilityFilter?: boolean;
  setAvailabilityFilter?: (value: boolean) => void;
  locationFilter?: string;
  setLocationFilter?: (value: string) => void;
}

export function MentorFilters({
  searchQuery,
  setSearchQuery,
  companyFilter,
  setCompanyFilter,
  educationFilter,
  setEducationFilter,
  experienceFilter,
  setExperienceFilter,
  sessionFilter,
  setSessionFilter,
  majorFilter = "all",
  setMajorFilter = () => {},
  schoolFilter = "all",
  setSchoolFilter = () => {},
  ratingFilter = "all",
  setRatingFilter = () => {},
  availabilityFilter = false,
  setAvailabilityFilter = () => {},
  locationFilter = "all",
  setLocationFilter = () => {},
}: MentorFiltersProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  const { data: companiesData = [] } = useAllCompanies();
  const { data: majorsData = [] } = useAllMajors();
  const { data: schoolsData = [] } = useAllSchools();

  // Ensure arrays are properly typed
  const companies = Array.isArray(companiesData) ? companiesData : [];
  const majors = Array.isArray(majorsData) ? majorsData : [];
  const schools = Array.isArray(schoolsData) ? schoolsData : [];

  // Calculate locations from the list of schools
  const locations = Array.from(new Set(schools.map(school => school.location).filter(Boolean)));

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (companyFilter !== "all") count++;
    if (educationFilter !== "all") count++;
    if (experienceFilter !== "all") count++;
    if (sessionFilter !== "all") count++;
    if (majorFilter !== "all") count++;
    if (schoolFilter !== "all") count++;
    if (ratingFilter !== "all") count++;
    if (availabilityFilter) count++;
    if (locationFilter !== "all") count++;
    
    setActiveFiltersCount(count);
  }, [
    companyFilter, 
    educationFilter, 
    experienceFilter, 
    sessionFilter, 
    majorFilter, 
    schoolFilter, 
    ratingFilter, 
    availabilityFilter,
    locationFilter
  ]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setIsScrolled(target.scrollTop > 20);
    };

    const dialogContent = document.querySelector('.max-h-\\[80vh\\]');
    dialogContent?.addEventListener('scroll', handleScroll);

    return () => {
      dialogContent?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`grid gap-4 p-4 transition-all duration-200 ${
      isScrolled ? 'gap-2 p-2' : ''
    }`}>
      <div className="flex flex-col gap-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              placeholder="Search mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full transition-all duration-200 pl-10 ${
                isScrolled ? 'h-8 text-sm' : 'h-10'
              }`}
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="absolute right-10 top-1/2 transform -translate-y-1/2">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className={`transition-all duration-200 ${
              isScrolled ? 'h-8 text-sm' : 'h-10'
            }`}>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Company" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={educationFilter} onValueChange={setEducationFilter}>
            <SelectTrigger className={`transition-all duration-200 ${
              isScrolled ? 'h-8 text-sm' : 'h-10'
            }`}>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Education" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Education Levels</SelectItem>
              <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
              <SelectItem value="Master">Master's Degree</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
              <SelectItem value="MD">MD</SelectItem>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Associate">Associate Degree</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters Section */}
        <div>
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 px-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide Advanced Filters" : "Show Advanced Filters"}
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className={`transition-all duration-200 ${
                  isScrolled ? 'h-8 text-sm' : 'h-10'
                }`}>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Experience Level" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience Levels</SelectItem>
                  <SelectItem value="1-3">1-3 Years</SelectItem>
                  <SelectItem value="4-7">4-7 Years</SelectItem>
                  <SelectItem value="8-10">8-10 Years</SelectItem>
                  <SelectItem value="10+">10+ Years</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sessionFilter} onValueChange={setSessionFilter}>
                <SelectTrigger className={`transition-all duration-200 ${
                  isScrolled ? 'h-8 text-sm' : 'h-10'
                }`}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Sessions Held" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="10+">10+ Sessions</SelectItem>
                  <SelectItem value="50+">50+ Sessions</SelectItem>
                  <SelectItem value="100+">100+ Sessions</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={majorFilter} onValueChange={setMajorFilter}>
                <SelectTrigger className={`transition-all duration-200 ${
                  isScrolled ? 'h-8 text-sm' : 'h-10'
                }`}>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Field/Major" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  {majors.map(major => (
                    <SelectItem key={major.id} value={major.id}>{major.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                <SelectTrigger className={`transition-all duration-200 ${
                  isScrolled ? 'h-8 text-sm' : 'h-10'
                }`}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="School" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map(school => (
                    <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className={`transition-all duration-200 ${
                  isScrolled ? 'h-8 text-sm' : 'h-10'
                }`}>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Rating" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Rating</SelectItem>
                  <SelectItem value="4+">4+ Stars</SelectItem>
                  <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className={`transition-all duration-200 ${
                  isScrolled ? 'h-8 text-sm' : 'h-10'
                }`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Location" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={String(location)} value={String(location)}>{String(location)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
