import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { MentorGrid } from "@/components/community/MentorGrid";
import type { Profile } from "@/types/database/profiles";

export default function Mentor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [hasAvailability, setHasAvailability] = useState(false);
  const { toast } = useToast();

  const { data: profiles = [], isLoading, error: queryError } = useQuery({
    queryKey: ['profiles', searchQuery, selectedSkills, locationFilter, companyFilter, schoolFilter, fieldFilter, hasAvailability],
    queryFn: async () => {
      try {
        let availableProfileIds: string[] | null = null;
        
        if (hasAvailability) {
          const { data: availabilityData, error: availabilityError } = await supabase
            .from('mentor_availability')
            .select('profile_id')
            .eq('is_available', true);

          if (availabilityError) {
            console.error('Error fetching availability:', availabilityError);
            return [];
          }

          availableProfileIds = availabilityData.map(row => row.profile_id);
          
          if (availableProfileIds.length === 0) {
            return [];
          }
        }

        let query = supabase
          .from('profiles')
          .select(`
            *,
            company:companies(name),
            school:schools(name),
            academic_major:majors(title),
            career:careers(title)
          `)
          .eq('user_type', 'mentor')
          .eq('onboarding_status', 'Approved');

        if (hasAvailability && availableProfileIds) {
          query = query.in('id', availableProfileIds);
        }

        if (searchQuery) {
          query = query.or(
            `full_name.ilike.%${searchQuery}%,` +
            `bio.ilike.%${searchQuery}%,` +
            `location.ilike.%${searchQuery}%,` +
            `skills.cs.{${searchQuery.toLowerCase()}},` +
            `tools_used.cs.{${searchQuery.toLowerCase()}},` +
            `keywords.cs.{${searchQuery.toLowerCase()}},` +
            `fields_of_interest.cs.{${searchQuery.toLowerCase()}}`
          );
        }

        if (locationFilter) {
          query = query.eq('location', locationFilter);
        }

        if (companyFilter) {
          query = query.eq('company_id', companyFilter);
        }

        if (schoolFilter) {
          query = query.eq('school_id', schoolFilter);
        }

        if (fieldFilter) {
          query = query.contains('fields_of_interest', [fieldFilter]);
        }

        if (selectedSkills.length > 0) {
          selectedSkills.forEach(skill => {
            query = query.contains('skills', [skill.toLowerCase()]);
          });
        }

        const { data, error: profilesError } = await query;

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          toast({
            title: "Error loading mentors",
            description: "There was an error loading the mentor profiles. Please try again.",
            variant: "destructive",
          });
          return [];
        }

        return data as Profile[];
      } catch (err) {
        console.error('Error in profiles query:', err);
        toast({
          title: "Error loading mentors",
          description: "There was an error loading the mentor profiles. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
            <div className="space-y-8">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 pb-4">
                <div className="transform transition-transform duration-200 py-2">
                  <h1 className="text-xl font-bold">PicoCareer Mentors</h1>
                </div>
                
                <div className="transform transition-all duration-200 -mx-2">
                  <CommunityFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedSkills={selectedSkills}
                    onSkillsChange={setSelectedSkills}
                    locationFilter={locationFilter}
                    onLocationChange={setLocationFilter}
                    companyFilter={companyFilter}
                    onCompanyChange={setCompanyFilter}
                    schoolFilter={schoolFilter}
                    onSchoolChange={setSchoolFilter}
                    fieldFilter={fieldFilter}
                    onFieldChange={setFieldFilter}
                    fields={[]}
                    hasAvailabilityFilter={true}
                    onAvailabilityChange={setHasAvailability}
                  />
                </div>
              </div>

              {queryError ? (
                <div className="text-center py-8">
                  <p className="text-destructive">Failed to load community profiles.</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 text-primary hover:underline"
                  >
                    Try refreshing the page
                  </button>
                </div>
              ) : (
                <MentorGrid 
                  profiles={profiles} 
                  isLoading={isLoading} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}