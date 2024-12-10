import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedCareersSection } from "@/components/sections/FeaturedCareersSection";
import { FeaturedMajorsSection } from "@/components/sections/FeaturedMajorsSection";
import { TopRatedMentorsSection } from "@/components/sections/TopRatedMentorsSection";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <MenuSidebar />
        <main className="flex-1 p-8">
          <ThemeToggle />
          <div className="max-w-7xl mx-auto">
            <HeroSection />
            <FeaturedCareersSection />
            <FeaturedMajorsSection />
            <TopRatedMentorsSection />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;