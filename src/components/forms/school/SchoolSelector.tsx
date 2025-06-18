
import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { School } from "@/types/database/schools";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { 
  SchoolSearchResult, 
  safeProcessSchoolSearchResults, 
  safeConstructLocation 
} from "./utils/schoolDataHelpers";

interface SchoolSelectorProps {
  value?: School | null;
  onValueChange: (school: School | null) => void;
  disabled?: boolean;
}

export function SchoolSelector({ value, onValueChange, disabled }: SchoolSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounced search to avoid too many API calls
  const debouncedSetSearch = useDebouncedCallback((query: string) => {
    setSearchQuery(query);
  }, 300);

  const { data: schools = [], isLoading, error } = useQuery({
    queryKey: ['schools-search', searchQuery],
    queryFn: async (): Promise<SchoolSearchResult[]> => {
      // Only search if we have at least 2 characters
      if (!searchQuery || searchQuery.length < 2) {
        return [];
      }

      try {
        let query = supabase
          .from('schools')
          .select('id, name, type, state, country, location, status')
          .eq('status', 'Approved')
          .order('name');

        // Search in school name
        query = query.ilike('name', `%${searchQuery}%`);

        const { data, error } = await query.limit(100);
        
        if (error) {
          console.error('Error fetching schools:', error);
          throw error;
        }
        
        // Use the safe processing function to handle null values
        return safeProcessSchoolSearchResults(data || []);
      } catch (error) {
        console.error('School query failed:', error);
        throw error;
      }
    },
    enabled: searchQuery.length >= 2, // Only run query when we have enough characters
    staleTime: 30000, // Cache results for 30 seconds
  });

  const handleSearchChange = (query: string) => {
    debouncedSetSearch(query);
  };

  const getDisplayValue = () => {
    if (!value) return "Select school...";
    
    try {
      const location = safeConstructLocation(value);
      return `${value.name}${value.type ? ` (${value.type})` : ''}${location !== 'Location not specified' ? ` - ${location}` : ''}`;
    } catch (error) {
      console.warn('Error getting display value:', error);
      return value.name || "Select school...";
    }
  };

  const getEmptyMessage = () => {
    if (!searchQuery) {
      return "Type at least 2 characters to search schools...";
    }
    if (isLoading) {
      return "Searching schools...";
    }
    if (error) {
      return "Error loading schools. Please try again.";
    }
    if (searchQuery.length < 2) {
      return "Type at least 2 characters to search...";
    }
    return "No schools found matching your search.";
  };

  // Convert SchoolSearchResult to School when selecting
  const handleSchoolSelect = (schoolResult: SchoolSearchResult) => {
    try {
      // Convert the minimal search result to a full School object for compatibility
      const schoolForSelection: School = {
        id: schoolResult.id,
        name: schoolResult.name,
        type: (schoolResult.type as any) || null,
        state: schoolResult.state || '',
        country: schoolResult.country || '',
        city: '', // Not available in search results
        location: schoolResult.location || safeConstructLocation(schoolResult),
        status: (schoolResult.status as any) || 'Approved',
        // Set default values for all other required fields
        website: '',
        email: '',
        phone: '',
        established_year: 0,
        student_population: 0,
        acceptance_rate: 0,
        tuition_in_state: 0,
        tuition_out_of_state: 0,
        tuition_international: 0,
        room_and_board: 0,
        application_fee: 0,
        application_deadline: '',
        sat_range_low: 0,
        sat_range_high: 0,
        act_range_low: 0,
        act_range_high: 0,
        gpa_average: 0,
        description: '',
        campus_size: '',
        programs_offered: [],
        notable_alumni: [],
        rankings: null,
        ranking: null,
        admissions_requirements: [],
        financial_aid_available: false,
        scholarship_opportunities: [],
        campus_facilities: [],
        student_organizations: [],
        sports_programs: [],
        research_opportunities: false,
        internship_programs: false,
        study_abroad_programs: false,
        diversity_stats: null,
        graduation_rate: 0,
        employment_rate: 0,
        average_salary_after_graduation: 0,
        notable_programs: [],
        campus_culture: '',
        location_benefits: [],
        housing_options: [],
        dining_options: [],
        transportation: [],
        safety_measures: [],
        sustainability_initiatives: [],
        technology_resources: [],
        library_resources: [],
        health_services: [],
        counseling_services: [],
        career_services: [],
        alumni_network_strength: '',
        partnerships_with_industry: [],
        accreditation: [],
        special_programs: [],
        language_programs: [],
        online_programs_available: false,
        part_time_programs_available: false,
        evening_programs_available: false,
        weekend_programs_available: false,
        summer_programs_available: false,
        continuing_education_programs: false,
        professional_development_programs: false,
        student_faculty_ratio: null,
        undergraduate_application_url: null,
        graduate_application_url: null,
        international_students_url: null,
        financial_aid_url: null,
        created_at: '',
        updated_at: '',
        author_id: '',
        featured: false,
        featured_priority: 0,
        cover_image_url: '',
        logo_url: '',
        virtual_tour_url: '',
        application_portal_url: '',
        admissions_page_url: '',
        financial_aid_page_url: '',
        campus_map_url: ''
      };
      
      onValueChange(value?.id === schoolResult.id ? null : schoolForSelection);
    } catch (error) {
      console.error('Error selecting school:', error);
      onValueChange(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
          disabled={disabled}
        >
          <span className="truncate">{getDisplayValue()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Search schools by name..." 
              onValueChange={handleSearchChange}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandEmpty className="py-6 text-center text-sm">
            {getEmptyMessage()}
          </CommandEmpty>
          {searchQuery.length >= 2 && (
            <CommandGroup className="max-h-64 overflow-auto">
              {schools.map((school) => {
                try {
                  const location = safeConstructLocation(school);
                  return (
                    <CommandItem
                      key={school.id}
                      onSelect={() => {
                        handleSchoolSelect(school);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value?.id === school.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">{school.name}</span>
                        <span className="text-sm text-muted-foreground truncate">
                          {school.type ? `${school.type} • ` : ''}{location}
                        </span>
                      </div>
                    </CommandItem>
                  );
                } catch (error) {
                  console.warn('Error rendering school item:', error, school);
                  return (
                    <CommandItem
                      key={school.id || `error-${Math.random()}`}
                      onSelect={() => {
                        handleSchoolSelect(school);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value?.id === school.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">{school.name || 'Unknown School'}</span>
                        <span className="text-sm text-muted-foreground truncate">
                          School information unavailable
                        </span>
                      </div>
                    </CommandItem>
                  );
                }
              })}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
