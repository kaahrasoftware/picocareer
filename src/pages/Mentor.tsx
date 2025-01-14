import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { MentorGrid } from "@/components/community/MentorGrid";
import type { Profile } from "@/types/database/profiles";
import { supabase } from "@/integrations/supabase/client";

export default function Mentor() {
  // Move all hooks to the top level
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [hasAvailability, setHasAvailability] = useState(false);
  const { toast } = useToast();

  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ['profiles', searchQuery, selectedSkills, locationFilter, companyFilter, schoolFilter, fieldFilter, hasAvailability],
    queryFn: async () => {
      try {
        // First get available mentor IDs if filter is active
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
          
          // If no available mentors, return empty array
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
            academic_major:majors!profiles_academic_major_id_fkey(title),
            career:careers!profiles_position_fkey(title)
          `)
          .eq('user_type', 'mentor')
          .eq('onboarding_status', 'Approved');

        // Apply availability filter if active
        if (hasAvailability && availableProfileIds) {
          query = query.in('id', availableProfileIds);
        }

        // Apply search filters
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

        // Apply additional filters
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

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return data as Profile[];
      } catch (err) {
        console.error('Error in profiles query:', err);
        toast({
          title: "Error loading profiles",
          description: "There was an error loading the community profiles. Please try again later.",
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
              <h1 className="text-3xl font-bold">PicoCareer Mentors</h1>
              
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

              {error ? (
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