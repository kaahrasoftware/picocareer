
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MapPin, BookOpen, Briefcase, GraduationCap, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export const ResourcesHighlightSection = () => {
  const { data: careers, isLoading: careersLoading } = useQuery({
    queryKey: ['featured-careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('id, title, description, industry, salary_range')
        .eq('featured', true)
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: majors, isLoading: majorsLoading } = useQuery({
    queryKey: ['featured-majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title, description, degree_level')
        .eq('status', 'Approved')
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: scholarships, isLoading: scholarshipsLoading } = useQuery({
    queryKey: ['featured-scholarships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scholarships')
        .select('id, title, description, amount, deadline')
        .eq('status', 'Approved')
        .order('deadline', { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const isLoading = careersLoading || majorsLoading || scholarshipsLoading;

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Loading Resources...</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Our Resources
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover career paths, academic programs, and scholarship opportunities tailored to your goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Featured Careers */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Featured Careers</h3>
            </div>
            {careers?.map((career) => (
              <Card key={career.id} className="hover:shadow-md transition-shadow">
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
                  {career.salary_range && (
                    <p className="text-sm font-medium text-green-600 mb-3">
                      {career.salary_range}
                    </p>
                  )}
                  <Link to={`/career/${career.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            <Link to="/career">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                View All Careers
              </Button>
            </Link>
          </div>

          {/* Featured Majors */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Academic Programs</h3>
            </div>
            {majors?.map((major) => (
              <Card key={major.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{major.title}</CardTitle>
                  {major.degree_level && (
                    <Badge variant="outline" className="w-fit">
                      {major.degree_level}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {major.description}
                  </p>
                  <Link to={`/program/${major.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Explore Program <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            <Link to="/majors">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                View All Programs
              </Button>
            </Link>
          </div>

          {/* Featured Scholarships */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Scholarships</h3>
            </div>
            {scholarships?.map((scholarship) => (
              <Card key={scholarship.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                  {scholarship.amount && (
                    <Badge variant="default" className="w-fit bg-green-100 text-green-800">
                      ${scholarship.amount.toLocaleString()}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {scholarship.description}
                  </p>
                  {scholarship.deadline && (
                    <p className="text-sm text-red-600 mb-3">
                      Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                    </p>
                  )}
                  <Link to={`/scholarship/${scholarship.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            <Link to="/scholarships">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                View All Scholarships
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="grid md:grid-cols-4 gap-4">
          <Link to="/mentors">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold">Find Mentors</h4>
                <p className="text-sm text-gray-600">Connect with industry experts</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/career-assessment">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold">Career Assessment</h4>
                <p className="text-sm text-gray-600">AI-powered career matching</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/events">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold">Events & Webinars</h4>
                <p className="text-sm text-gray-600">Educational workshops</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/blog">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold">Blog & Resources</h4>
                <p className="text-sm text-gray-600">Latest insights and tips</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
};
