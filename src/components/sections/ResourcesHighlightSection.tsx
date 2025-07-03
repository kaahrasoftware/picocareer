
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Users, Trophy, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ResourcesHighlightSection() {
  // Fetch featured careers
  const { data: careers = [] } = useQuery({
    queryKey: ['featured-careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('id, title, description, salary_range')
        .limit(3);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch featured majors
  const { data: majors = [] } = useQuery({
    queryKey: ['featured-majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title, description')
        .limit(3);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch top mentors
  const { data: mentors = [] } = useQuery({
    queryKey: ['top-mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, bio, avatar_url')
        .eq('user_type', 'mentor')
        .limit(3);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch recent opportunities
  const { data: opportunities = [] } = useQuery({
    queryKey: ['recent-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('id, title, description')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Our Resources
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover career paths, connect with mentors, and find opportunities to advance your journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Careers */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Featured Careers</h3>
                <p className="text-gray-600">Explore high-demand career paths</p>
              </div>
            </div>
            <div className="space-y-4">
              {careers.map((career) => (
                <div key={career.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-gray-900">{career.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {career.description}
                  </p>
                  {career.salary_range && (
                    <Badge variant="secondary" className="mt-2">
                      {career.salary_range}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <Button asChild className="w-full mt-4">
              <Link to="/careers">View All Careers</Link>
            </Button>
          </Card>

          {/* Top Mentors */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Top Mentors</h3>
                <p className="text-gray-600">Connect with industry experts</p>
              </div>
            </div>
            <div className="space-y-4">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mentor.avatar_url || undefined} />
                    <AvatarFallback>
                      {mentor.first_name?.[0]}{mentor.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {mentor.first_name} {mentor.last_name}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {mentor.bio || 'Experienced professional ready to help'}
                    </p>
                  </div>
                  <Star className="h-4 w-4 text-yellow-500" />
                </div>
              ))}
            </div>
            <Button asChild className="w-full mt-4">
              <Link to="/mentor">Find Mentors</Link>
            </Button>
          </Card>

          {/* Featured Majors */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Popular Programs</h3>
                <p className="text-gray-600">Discover academic programs</p>
              </div>
            </div>
            <div className="space-y-4">
              {majors.map((major) => (
                <div key={major.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{major.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {major.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild className="w-full mt-4">
              <Link to="/program">Explore Programs</Link>
            </Button>
          </Card>

          {/* Recent Opportunities */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Latest Opportunities</h3>
                <p className="text-gray-600">Fresh opportunities await</p>
              </div>
            </div>
            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {opportunity.description}
                  </p>
                </div>
              ))}
            </div>
            <Button asChild className="w-full mt-4">
              <Link to="/opportunities">View Opportunities</Link>
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}
