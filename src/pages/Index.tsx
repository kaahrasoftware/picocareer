import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedCareersSection } from "@/components/sections/FeaturedCareersSection";
import { FeaturedMajorsSection } from "@/components/sections/FeaturedMajorsSection";
import { TopRatedMentorsSection } from "@/components/sections/TopRatedMentorsSection";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-kahra-dark text-white">
        <MenuSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <HeroSection />
            <FeaturedCareersSection />
            <FeaturedMajorsSection />
            <TopRatedMentorsSection />
          </div>
        </main>
        <ProfileSidebar />
      </div>
    </SidebarProvider>
  );
};

export default Index;