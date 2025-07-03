
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Briefcase, GraduationCap, Building } from 'lucide-react';
import { useFeaturedSchools } from '@/hooks/useFeaturedSchools';

// Define simplified interfaces for featured content
interface FeaturedSchool {
  id: string;
  name: string;
  country: string;
  status: string;
  featured: boolean;
  website?: string;
  description?: string;
  image_url?: string;
  acceptance_rate?: number;
}

interface FeaturedCareer {
  id: string;
  title: string;
  description: string;
  salary_range?: string;
  image_url?: string;
  industry?: string;
  featured: boolean;
}

interface FeaturedMajor {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  featured: boolean;
}

export function FeaturedContentTabsSection() {
  const [activeTab, setActiveTab] = useState('schools');
  
  const { data: schools = [], isLoading: schoolsLoading } = useFeaturedSchools(4);

  // Mock data for careers and majors - in real implementation, these would come from hooks
  const featuredCareers: FeaturedCareer[] = [];
  const featuredMajors: FeaturedMajor[] = [];

  const featuredSchools = schools as FeaturedSchool[];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Your Future</h2>
          <p className="text-lg text-gray-600">Discover schools, careers, and academic programs that match your interests</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="schools" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Schools
            </TabsTrigger>
            <TabsTrigger value="careers" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Careers
            </TabsTrigger>
            <TabsTrigger value="majors" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Majors
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="schools" className="space-y-6">
            {schoolsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-32 bg-gray-200 rounded mb-3"></div>
                      <div className="h-5 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredSchools.map((school) => (
                  <Card key={school.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      {school.image_url && (
                        <img 
                          src={school.image_url} 
                          alt={school.name}
                          className="w-full h-32 object-cover rounded mb-3 group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {school.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {school.country}
                        </Badge>
                      </div>
                      {school.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {school.description}
                        </p>
                      )}
                      {school.acceptance_rate && (
                        <p className="text-xs text-gray-500 mb-3">
                          {school.acceptance_rate}% acceptance rate
                        </p>
                      )}
                      {school.website && (
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <a href={school.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Learn More
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="text-center">
              <Button variant="outline" size="lg">
                View All Schools
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="careers" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-gray-500">Featured careers coming soon...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="majors" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-gray-500">Featured majors coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
