
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MentorCard } from '@/components/MentorCard';
import { MentorFilters } from '@/components/mentors/MentorFilters';
import { ProfileDetailsDialog } from '@/components/ProfileDetailsDialog';
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Star, MapPin, Search } from "lucide-react";

export default function Mentor() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  // Check if the dialog should be open on initial load
  const initialDialogState = searchParams.get('dialog') === 'true' && searchParams.get('profileId');
  const [open, setOpen] = useState(!!initialDialogState);

  const handleOpenChange = (newState: boolean) => {
    setOpen(newState);
    if (!newState) {
      // Clear the dialog params from the URL
      setSearchParams({});
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [educationFilter, setEducationFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [majorFilter, setMajorFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState(false);
  const [locationFilter, setLocationFilter] = useState('all');

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

      // Company filter
      const matchesCompany = companyFilter === 'all' || mentor.company_id === companyFilter;

      // Education filter  
      const matchesEducation = educationFilter === 'all' || 
        (mentor.highest_degree && isValidDegree(mentor.highest_degree) && mentor.highest_degree === educationFilter);

      // Experience filter
      const matchesExperience = experienceFilter === 'all' || 
        (mentor.years_of_experience && checkExperienceRange(mentor.years_of_experience, experienceFilter));

      // Session filter
      const matchesSession = sessionFilter === 'all' || checkSessionRange(mentor.total_booked_sessions || 0, sessionFilter);

      // Major filter
      const matchesMajor = majorFilter === 'all' || mentor.academic_major_id === majorFilter;

      // School filter
      const matchesSchool = schoolFilter === 'all' || mentor.school_id === schoolFilter;

      // Location filter
      const matchesLocation = locationFilter === 'all' || 
        mentor.location?.toLowerCase().includes(locationFilter.toLowerCase());

      // Top mentor filter
      const matchesTopMentor = !availabilityFilter || mentor.top_mentor;

      return matchesSearch && matchesCompany && matchesEducation && 
             matchesExperience && matchesSession && matchesMajor && 
             matchesSchool && matchesLocation && matchesTopMentor;
    });
  }, [mentors, searchQuery, companyFilter, educationFilter, experienceFilter, 
      sessionFilter, majorFilter, schoolFilter, ratingFilter, availabilityFilter, locationFilter]);

  const checkExperienceRange = (experience: number, range: string) => {
    switch (range) {
      case '1-3': return experience >= 1 && experience <= 3;
      case '4-7': return experience >= 4 && experience <= 7;
      case '8-10': return experience >= 8 && experience <= 10;
      case '10+': return experience > 10;
      default: return true;
    }
  };

  const checkSessionRange = (sessions: number, range: string) => {
    switch (range) {
      case '10+': return sessions >= 10;
      case '50+': return sessions >= 50;
      case '100+': return sessions >= 100;
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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Mentor</h1>
          <p className="text-lg opacity-90">
            Connect with experienced professionals who can guide your career journey
          </p>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Mentors</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalMentors}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Top Mentors</p>
              <p className="text-2xl font-bold text-green-900">{stats.topMentors}</p>
            </div>
            <Star className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Avg Experience</p>
              <p className="text-2xl font-bold text-purple-900">{stats.avgExperience.toFixed(1)} yrs</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Total Sessions</p>
              <p className="text-2xl font-bold text-orange-900">{stats.totalSessions}</p>
            </div>
            <Star className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80">
          <MentorFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            companyFilter={companyFilter}
            setCompanyFilter={setCompanyFilter}
            educationFilter={educationFilter}
            setEducationFilter={setEducationFilter}
            experienceFilter={experienceFilter}
            setExperienceFilter={setExperienceFilter}
            sessionFilter={sessionFilter}
            setSessionFilter={setSessionFilter}
            majorFilter={majorFilter}
            setMajorFilter={setMajorFilter}
            schoolFilter={schoolFilter}
            setSchoolFilter={setSchoolFilter}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            availabilityFilter={availabilityFilter}
            setAvailabilityFilter={setAvailabilityFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
          />
        </div>
        
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {filteredMentors.length} mentors found
            </h2>
          </div>
          
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
