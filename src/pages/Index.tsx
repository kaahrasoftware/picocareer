import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedCareersSection } from "@/components/sections/FeaturedCareersSection";
import { FeaturedMajorsSection } from "@/components/sections/FeaturedMajorsSection";
import { TopRatedMentorsSection } from "@/components/sections/TopRatedMentorsSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

const Index = () => {
  // Set dark theme by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <MenuSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-[1400px] mx-auto">
            <ThemeToggle />
            <HeroSection />
            <FeaturedCareersSection />
            <FeaturedMajorsSection />
            <TopRatedMentorsSection />
            <Footer />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;