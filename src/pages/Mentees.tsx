
import { useState, useMemo } from 'react';
import { Search, Users, GraduationCap, Star, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MenteeCard } from '@/components/mentees/MenteeCard';
import { MenteeFilters } from '@/components/mentees/MenteeFilters';
import { ProfileDetailsDialog } from '@/components/ProfileDetailsDialog';

interface MenteeProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  school_id?: string;
  academic_major_id?: string;
  skills?: string[];
  fields_of_interest?: string[];
  user_type: string;
  created_at: string;
  school?: { name: string };
  academic_major?: { title: string };
  academic_records?: Array<{
    semester_gpa?: number;
    cumulative_gpa?: number;
    year: number;
    semester: string;
    honors?: string[];
    awards?: string[];
  }>;
  projects?: Array<{
    title: string;
    status: string;
    technologies?: string[];
  }>;
  interests?: Array<{
    interest_name: string;
    category: string;
  }>;
}

export default function Mentees() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    major: '',
    school: '',
    gpaRange: '',
    skills: [] as string[],
    academicYear: ''
  });
  const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);

  // Fetch mentee profiles with related data
  const { data: mentees = [], isLoading } = useQuery({
    queryKey: ['mentees', selectedFilters],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          location,
          school_id,
          academic_major_id,
          skills,
          fields_of_interest,
          user_type,
          created_at,
          schools:school_id(name),
          majors:academic_major_id(title)
        `)
        .eq('user_type', 'mentee')
        .order('created_at', { ascending: false });

      // Apply filters
      if (selectedFilters.major) {
        query = query.eq('academic_major_id', selectedFilters.major);
      }
      if (selectedFilters.school) {
        query = query.eq('school_id', selectedFilters.school);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enhance profiles with academic data
      const enhancedProfiles = await Promise.all(
        (data || []).map(async (profile) => {
          // Fetch academic records
          const { data: academicRecords } = await supabase
            .from('mentee_academic_records')
            .select('*')
            .eq('mentee_id', profile.id)
            .order('year', { ascending: false })
            .limit(3);

          // Fetch projects
          const { data: projects } = await supabase
            .from('mentee_projects')
            .select('title, status, technologies')
            .eq('mentee_id', profile.id)
            .limit(3);

          // Fetch interests
          const { data: interests } = await supabase
            .from('mentee_interests')
            .select('interest_name, category')
            .eq('mentee_id', profile.id)
            .limit(5);

          return {
            ...profile,
            school: profile.schools,
            academic_major: profile.majors,
            academic_records: academicRecords || [],
            projects: projects || [],
            interests: interests || []
          };
        })
      );

      return enhancedProfiles;
    }
  });

  // Filter mentees based on search and filters
  const filteredMentees = useMemo(() => {
    return mentees.filter((mentee) => {
      const matchesSearch = 
        mentee.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentee.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentee.school?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentee.academic_major?.title?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSkills = selectedFilters.skills.length === 0 || 
        selectedFilters.skills.some(skill => 
          mentee.skills?.includes(skill) || 
          mentee.fields_of_interest?.includes(skill)
        );

      const matchesGPA = !selectedFilters.gpaRange || 
        (mentee.academic_records?.[0]?.cumulative_gpa && 
         checkGPARange(mentee.academic_records[0].cumulative_gpa, selectedFilters.gpaRange));

      return matchesSearch && matchesSkills && matchesGPA;
    });
  }, [mentees, searchQuery, selectedFilters]);

  const checkGPARange = (gpa: number, range: string) => {
    switch (range) {
      case '3.5+': return gpa >= 3.5;
      case '3.0-3.5': return gpa >= 3.0 && gpa < 3.5;
      case '2.5-3.0': return gpa >= 2.5 && gpa < 3.0;
      case 'below-2.5': return gpa < 2.5;
      default: return true;
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMentees = mentees.length;
    const universities = new Set(mentees.map(m => m.school?.name).filter(Boolean)).size;
    const avgGPA = mentees
      .map(m => m.academic_records?.[0]?.cumulative_gpa)
      .filter(Boolean)
      .reduce((sum, gpa, _, arr) => sum + (gpa || 0) / arr.length, 0);
    const topPerformers = mentees.filter(m => 
      m.academic_records?.[0]?.cumulative_gpa && 
      m.academic_records[0].cumulative_gpa >= 3.5
    ).length;

    return { totalMentees, universities, avgGPA, topPerformers };
  }, [mentees]);

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
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
          <h1 className="text-4xl font-bold mb-4">Discover Our Mentee Community</h1>
          <p className="text-lg opacity-90">
            Connect with talented students on their academic journey
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Mentees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalMentees}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Universities</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.universities}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Average GPA</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {stats.avgGPA ? stats.avgGPA.toFixed(2) : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Top Performers</CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.topPerformers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search mentees by name, school, major, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <MenteeFilters 
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
        />
      </div>

      {/* Mentees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentees.map((mentee) => (
          <MenteeCard
            key={mentee.id}
            mentee={mentee}
            onViewProfile={() => setSelectedMenteeId(mentee.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredMentees.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No mentees found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}

      {/* Profile Dialog */}
      {selectedMenteeId && (
        <ProfileDetailsDialog
          userId={selectedMenteeId}
          open={!!selectedMenteeId}
          onOpenChange={() => setSelectedMenteeId(null)}
        />
      )}
    </div>
  );
}
