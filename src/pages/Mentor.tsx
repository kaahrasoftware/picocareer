import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MentorCard } from '@/components/MentorCard';
import { MentorFilters } from '@/components/mentor/MentorFilters';
import { MentorSearch } from '@/components/mentor/MentorSearch';
import { MentorStats } from '@/components/mentor/MentorStats';
import { ProfileDetailsDialog } from '@/components/ProfileDetailsDialog';
import { MentorHero } from '@/components/mentor/MentorHero';
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Mentor() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  // Check if the dialog should be open on initial load
  const initialDialogState = searchParams.get('dialog') === 'true' && searchParams.get('profileId');
  const [open, setOpen] = useState(initialDialogState);

  const handleOpenChange = (newState: boolean) => {
    setOpen(newState);
    if (!newState) {
      // Clear the dialog params from the URL
      setSearchParams({});
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    skills: [] as string[],
    keywords: [] as string[],
    location: '',
    yearsExperience: '',
    education: '',
    hourlyRate: '',
    rating: '',
    topMentor: false
  });

  const { data: mentors = [], isLoading, error } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          location,
          position,
          years_of_experience,
          skills,
          tools_used,
          keywords,
          fields_of_interest,
          highest_degree,
          user_type,
          top_mentor,
          total_booked_sessions,
          company_id,
          school_id,
          academic_major_id,
          companies:company_id(name),
          schools:school_id(name),
          majors:academic_major_id(title)
        `)
        .eq('user_type', 'mentor')
        .order('top_mentor', { ascending: false })
        .order('total_booked_sessions', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Filter mentors based on search and filters
  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      // Search filter
      const matchesSearch = 
        mentor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.companies?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.schools?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.majors?.title?.toLowerCase().includes(searchQuery.toLowerCase());

      // Skills filter
      const matchesSkills = selectedFilters.skills.length === 0 || 
        selectedFilters.skills.some(skill => 
          mentor.skills?.includes(skill) || 
          mentor.tools_used?.includes(skill)
        );

      // Keywords filter
      const matchesKeywords = selectedFilters.keywords.length === 0 || 
        selectedFilters.keywords.some(keyword => 
          mentor.keywords?.includes(keyword) || 
          mentor.fields_of_interest?.includes(keyword)
        );

      // Location filter
      const matchesLocation = !selectedFilters.location || 
        mentor.location?.toLowerCase().includes(selectedFilters.location.toLowerCase());

      // Years of experience filter
      const matchesExperience = !selectedFilters.yearsExperience || 
        (mentor.years_of_experience && checkExperienceRange(mentor.years_of_experience, selectedFilters.yearsExperience));

      // Education filter - Fix type issue by checking if degree is valid
      const matchesEducation = !selectedFilters.education || 
        (mentor.highest_degree && isValidDegree(mentor.highest_degree) && mentor.highest_degree === selectedFilters.education);

      // Top mentor filter
      const matchesTopMentor = !selectedFilters.topMentor || mentor.top_mentor;

      return matchesSearch && matchesSkills && matchesKeywords && 
             matchesLocation && matchesExperience && matchesEducation && matchesTopMentor;
    });
  }, [mentors, searchQuery, selectedFilters]);

  const checkExperienceRange = (experience: number, range: string) => {
    switch (range) {
      case '0-2': return experience >= 0 && experience <= 2;
      case '3-5': return experience >= 3 && experience <= 5;
      case '6-10': return experience >= 6 && experience <= 10;
      case '10+': return experience > 10;
      default: return true;
    }
  };

  const isValidDegree = (degree: string): degree is "No Degree" | "High School" | "Associate" | "Bachelor" | "Master" | "MD" | "PhD" => {
    return ["No Degree", "High School", "Associate", "Bachelor", "Master", "MD", "PhD"].includes(degree);
  };

  const stats = useMemo(() => {
    const totalMentors = mentors.length;
    const topMentors = mentors.filter(m => m.top_mentor).length;
    const avgExperience = mentors.reduce((sum, m) => sum + (m.years_of_experience || 0), 0) / totalMentors;
    const totalSessions = mentors.reduce((sum, m) => sum + (m.total_booked_sessions || 0), 0);

    return { totalMentors, topMentors, avgExperience, totalSessions };
  }, [mentors]);

  const openMentorDialog = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setSearchParams({ dialog: 'true', profileId: mentorId });
  };

  const closeMentorDialog = () => {
    setSelectedMentorId(null);
    setSearchParams({});
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Mentors</h2>
          <p className="text-muted-foreground">There was an error loading the mentors. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <MentorHero />
      
      <MentorStats stats={stats} />
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80">
          <MentorFilters 
            filters={selectedFilters}
            onFiltersChange={setSelectedFilters}
            mentors={mentors}
          />
        </div>
        
        <div className="flex-1 space-y-6">
          <MentorSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalMentors={filteredMentors.length}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                id={mentor.id}
                name={mentor.full_name || ''}
                position={mentor.position}
                company={mentor.companies?.name}
                location={mentor.location}
                skills={mentor.skills || []}
                keywords={mentor.keywords || []}
                avatarUrl={mentor.avatar_url}
                education={mentor.majors?.title}
                topMentor={mentor.top_mentor}
                onClick={() => openMentorDialog(mentor.id)}
              />
            ))}
          </div>
          
          {filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedMentorId && (
        <ProfileDetailsDialog 
          userId={selectedMentorId}
          open={!!selectedMentorId}
          onOpenChange={closeMentorDialog}
        />
      )}
    </div>
  );
}
