import { SidebarProvider } from "@/components/ui/sidebar";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedCareersSection } from "@/components/sections/FeaturedCareersSection";
import { FeaturedMajorsSection } from "@/components/sections/FeaturedMajorsSection";
import { TopRatedMentorsSection } from "@/components/sections/TopRatedMentorsSection";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  // Set dark theme by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Fetch initial data for sections
  const { data: careers } = useQuery({
    queryKey: ['featuredCareers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('featured', true)
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: majors } = useQuery({
    queryKey: ['featuredMajors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('featured', true)
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: mentors } = useQuery({
    queryKey: ['topMentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('top_mentor', true)
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <SidebarProvider>
      <div className="app-layout">
        <div className="main-content">
          <div className="w-full px-8 sm:px-12 lg:px-16 py-8">
            <div className="w-full max-w-7xl mx-auto space-y-8">
              <HeroSection />
              <FeaturedCareersSection initialCareers={careers} />
              <FeaturedMajorsSection initialMajors={majors} />
              <TopRatedMentorsSection initialMentors={mentors} />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}