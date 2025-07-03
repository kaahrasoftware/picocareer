
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, Users, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export function ResourcesHighlightSection() {
  // Fetch featured careers
  const { data: careers = [] } = useQuery({
    queryKey: ['featured-careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('id, title, description, industry, featured')
        .eq('featured', true)
        .eq('status', 'Approved')
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
        .select('id, first_name, last_name, bio, user_type, avatar_url, current_position')
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
        .select('id, title, description, type, deadline')
        .eq('status', 'Approved')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Our Resources
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover career paths, connect with mentors, and find opportunities to advance your future.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Careers */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Featured Careers</h3>
            </div>
            
            {careers.map((career) => (
              <Card key={career.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{career.title}</CardTitle>
                  {career.industry && (
                    <Badge variant="secondary" className="w-fit">
                      {career.industry}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {career.description}
                  </p>
                  <Link to={`/careers/${career.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            
            <Link to="/careers">
              <Button className="w-full">View All Careers</Button>
            </Link>
          </div>

          {/* Top Mentors */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Expert Mentors</h3>
            </div>
            
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {mentor.avatar_url ? (
                      <img 
                        src={mentor.avatar_url} 
                        alt={`${mentor.first_name} ${mentor.last_name}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {mentor.first_name} {mentor.last_name}
                      </h4>
                      {mentor.current_position && (
                        <p className="text-sm text-gray-600">{mentor.current_position}</p>
                      )}
                    </div>
                  </div>
                  {mentor.bio && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {mentor.bio}
                    </p>
                  )}
                  <Link to={`/mentors/${mentor.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            
            <Link to="/mentors">
              <Button className="w-full">Browse All Mentors</Button>
            </Link>
          </div>

          {/* Recent Opportunities */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Latest Opportunities</h3>
            </div>
            
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  {opportunity.type && (
                    <Badge variant="secondary" className="w-fit">
                      {opportunity.type}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {opportunity.description}
                  </p>
                  {opportunity.deadline && (
                    <p className="text-xs text-red-600 mb-3">
                      Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                    </p>
                  )}
                  <Link to={`/opportunities/${opportunity.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            
            <Link to="/opportunities">
              <Button className="w-full">View All Opportunities</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
