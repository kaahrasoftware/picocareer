
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
  
  const { data: companies = [] } = useAllCompanies();
  const { data: majors = [] } = useAllMajors();
  const { data: schools = [] } = useAllSchools();

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
                  <SelectItem value="5">5 Stars Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className={`transition-all duration-200 ${
                  isScrolled ? 'h-8 text-sm' : 'h-10'
                }`}>
                  <div className="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground">
                      <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.00156 4.98906 7.11328 5.74625 7.8775C6.5025 8.64078 7.25 9.5 7.25 9.5H7.75C7.75 9.5 8.5 8.64078 9.25625 7.8775C10.0134 7.11328 11.125 6.00156 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM7.5 1.375C9.22437 1.375 10.625 2.77563 10.625 4.5C10.625 5.75 9.69516 6.69359 8.96656 7.42094C8.45951 7.92743 7.95665 8.40102 7.66857 8.77164C7.6124 8.84109 7.56256 8.90393 7.51902 8.96033C7.50334 8.98424 7.46964 9.02741 7.44261 9.06351C7.4375 9.06999 7.42098 9.09202 7.41433 9.10033C7.40868 9.09206 7.39222 9.07007 7.38711 9.06357C7.36009 9.02747 7.3264 8.98435 7.31073 8.96046C7.26718 8.90409 7.21734 8.84128 7.16117 8.77186C6.87309 8.40126 6.37024 7.92769 5.86322 7.42125C5.13469 6.69391 4.20484 5.75031 4.20484 4.5C4.20484 2.77563 5.60547 1.375 7.32984 1.375H7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                      <path d="M4.56232 9.08438C3.70716 9.20625 3.125 9.55016 3.125 10C3.125 10.5523 3.95939 11 5 11C5.55122 11 6.02582 10.8505 6.32838 10.6159C6.06169 10.277 5.79213 9.96828 5.58535 9.76234C5.23382 9.41224 4.90492 9.19739 4.56232 9.08438ZM10.4377 9.08438C10.0951 9.19739 9.76618 9.41224 9.41465 9.76234C9.20787 9.96828 8.93831 10.277 8.67162 10.6159C8.97418 10.8505 9.44878 11 10 11C11.0406 11 11.875 10.5523 11.875 10C11.875 9.55016 11.2928 9.20625 10.4377 9.08438ZM2.5 10C2.5 9 3.5 8.5 5 8.5C5.62481 8.5 6.48458 8.80542 7.08283 9.40432C7.1712 9.4927 7.287 9.62384 7.38987 9.73853C7.39748 9.7468 7.45964 9.81859 7.49369 9.86023C7.50356 9.87232 7.50147 9.87172 7.5 9.86984C7.49853 9.87172 7.49644 9.87232 7.50631 9.86023C7.54036 9.81859 7.60252 9.7468 7.61013 9.73853C7.713 9.62384 7.8288 9.4927 7.91717 9.40432C8.51542 8.80542 9.37519 8.5 10 8.5C11.5 8.5 12.5 9 12.5 10C12.5 11 11.5 11.5 10 11.5C9.14814 11.5 8.51463 11.2497 8.14183 10.8599C7.85159 11.2071 7.64651 11.5299 7.59928 11.5898C7.49916 11.72 7.25181 11.72 7.15169 11.5898C7.10446 11.5299 6.89841 11.2071 6.60817 10.8599C6.23537 11.2497 5.60186 11.5 4.75 11.5C3.25 11.5 2.25 11 2.5 10Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                    </svg>
                    <SelectValue placeholder="Location" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center col-span-1 space-x-2">
                <Button 
                  variant={availabilityFilter ? "default" : "outline"} 
                  className={`w-full flex items-center gap-2 ${availabilityFilter ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => setAvailabilityFilter(!availabilityFilter)}
                >
                  <Calendar className="h-4 w-4" />
                  {availabilityFilter ? "Available Now" : "Show Available"} 
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
