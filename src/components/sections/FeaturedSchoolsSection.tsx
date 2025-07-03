
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Users, GraduationCap } from 'lucide-react';
import { useFeaturedSchools } from '@/hooks/useFeaturedSchools';

// Define a simple School interface for featured schools
interface FeaturedSchool {
  id: string;
  name: string;
  country: string;
  status: string;
  featured: boolean;
  featured_priority?: number;
  website?: string;
  description?: string;
  image_url?: string;
  acceptance_rate?: number;
  admissions_page_url?: string;
}

export function FeaturedSchoolsSection() {
  const { data: schools = [], isLoading } = useFeaturedSchools(6);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Schools</h2>
            <p className="text-lg text-gray-600">Discover top educational institutions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const featuredSchools = schools as FeaturedSchool[];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Schools</h2>
          <p className="text-lg text-gray-600">Discover top educational institutions from around the world</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSchools.map((school) => (
            <Card key={school.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative">
                {school.image_url && (
                  <img 
                    src={school.image_url} 
                    alt={school.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 text-blue-700">
                    <MapPin className="h-3 w-3 mr-1" />
                    {school.country}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {school.name}
                </h3>
                
                {school.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {school.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  {school.acceptance_rate && (
                    <div className="flex items-center text-sm text-gray-500">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      {school.acceptance_rate}% acceptance rate
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {school.website && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      className="flex-1"
                    >
                      <a href={school.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                  
                  {school.admissions_page_url && (
                    <Button 
                      size="sm" 
                      asChild
                      className="flex-1"
                    >
                      <a href={school.admissions_page_url} target="_blank" rel="noopener noreferrer">
                        Apply Now
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Schools
          </Button>
        </div>
      </div>
    </section>
  );
}
