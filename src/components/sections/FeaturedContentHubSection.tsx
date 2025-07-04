
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building, Briefcase, GraduationCap, Users, ArrowRight } from 'lucide-react';
import { FeaturedSchoolsSection } from '@/components/sections/FeaturedSchoolsSection';
import { FeaturedCareersSection } from '@/components/sections/FeaturedCareersSection';
import { FeaturedMajorsSection } from '@/components/sections/FeaturedMajorsSection';
import { Link } from 'react-router-dom';

export function FeaturedContentHubSection() {
  const [activeTab, setActiveTab] = useState('schools');

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#00A6D4]/10 text-[#00A6D4] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            Curated for Your Success
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Explore Your Future</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the best schools, most promising careers, and academic programs that align with your goals and interests
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-12 h-14 bg-gray-100 rounded-2xl p-2">
            <TabsTrigger 
              value="schools" 
              className="flex items-center gap-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#00A6D4] font-medium transition-all duration-200"
            >
              <Building className="h-5 w-5" />
              <span className="hidden sm:inline">Schools</span>
            </TabsTrigger>
            <TabsTrigger 
              value="careers" 
              className="flex items-center gap-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#00A6D4] font-medium transition-all duration-200"
            >
              <Briefcase className="h-5 w-5" />
              <span className="hidden sm:inline">Careers</span>
            </TabsTrigger>
            <TabsTrigger 
              value="majors" 
              className="flex items-center gap-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#00A6D4] font-medium transition-all duration-200"
            >
              <GraduationCap className="h-5 w-5" />
              <span className="hidden sm:inline">Majors</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="schools" className="space-y-8">
            <FeaturedSchoolsSection />
            <div className="text-center">
              <Button asChild size="lg" variant="outline" className="group border-[#00A6D4]/20 text-[#00A6D4] hover:bg-[#00A6D4]/5 hover:border-[#00A6D4]/30">
                <Link to="/school" className="flex items-center gap-2">
                  View All Schools
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="careers" className="space-y-8">
            <FeaturedCareersSection />
            <div className="text-center">
              <Button asChild size="lg" variant="outline" className="group border-[#00A6D4]/20 text-[#00A6D4] hover:bg-[#00A6D4]/5 hover:border-[#00A6D4]/30">
                <Link to="/career" className="flex items-center gap-2">
                  View All Careers
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="majors" className="space-y-8">
            <FeaturedMajorsSection />
            <div className="text-center">
              <Button asChild size="lg" variant="outline" className="group border-[#00A6D4]/20 text-[#00A6D4] hover:bg-[#00A6D4]/5 hover:border-[#00A6D4]/30">
                <Link to="/program" className="flex items-center gap-2">
                  View All Programs
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
