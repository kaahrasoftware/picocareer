
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award, Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ResourcesHighlightSection() {
  // Fetch recent blogs
  const { data: blogs } = useQuery({
    queryKey: ['recent-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, summary, created_at, author_id, profiles!blogs_author_id_fkey(first_name, last_name)')
        .eq('status', 'Approved')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch upcoming events
  const { data: events } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, start_time, event_type')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch featured opportunities
  const { data: opportunities } = useQuery({
    queryKey: ['featured-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('id, title, description, type, location, company_id, companies(name)')
        .eq('status', 'Active')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch active mentors count
  const { data: mentorStats } = useQuery({
    queryKey: ['mentor-stats'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'mentor');
      
      return { activeMentors: count || 0 };
    }
  });

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Our Resources
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access a wealth of information to guide your educational and career journey
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {blogs?.length || 0}+
              </div>
              <div className="text-sm text-gray-600">Recent Articles</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {mentorStats?.activeMentors || 0}+
              </div>
              <div className="text-sm text-gray-600">Active Mentors</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {opportunities?.length || 0}+
              </div>
              <div className="text-sm text-gray-600">New Opportunities</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {events?.length || 0}+
              </div>
              <div className="text-sm text-gray-600">Upcoming Events</div>
            </CardContent>
          </Card>
        </div>

        {/* Resource Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Blog Posts */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Latest Articles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {blogs && blogs.length > 0 ? (
                blogs.map((blog) => (
                  <div key={blog.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">
                      <Link to={`/blogs/${blog.id}`} className="hover:text-primary">
                        {blog.title}
                      </Link>
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {blog.summary}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      By {blog.profiles?.first_name} {blog.profiles?.last_name}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent articles</p>
              )}
              <Link to="/blogs">
                <Button variant="outline" size="sm" className="w-full">
                  View All Articles <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events && events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">
                      <Link to={`/events/${event.id}`} className="hover:text-primary">
                        {event.title}
                      </Link>
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {event.event_type}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.start_time).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
              <Link to="/events">
                <Button variant="outline" size="sm" className="w-full">
                  View All Events <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Featured Opportunities */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                New Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {opportunities && opportunities.length > 0 ? (
                opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">
                      <Link to={`/opportunities/${opportunity.id}`} className="hover:text-primary">
                        {opportunity.title}
                      </Link>
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {opportunity.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs capitalize">
                        {opportunity.type}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {opportunity.location}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No new opportunities</p>
              )}
              <Link to="/opportunities">
                <Button variant="outline" size="sm" className="w-full">
                  View All Opportunities <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
