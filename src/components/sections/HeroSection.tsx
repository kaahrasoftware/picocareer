
import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, UserSearch } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";

export const HeroSection = () => {
  const { session } = useAuthSession();
  const isLoggedIn = !!session?.user;

  return (
    <>
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 flex items-center justify-center flex-wrap gap-2">
            <span className="bg-gradient-to-r from-[#333333] to-[#555555] bg-clip-text text-transparent py-2">
              The Key to Unlocking Your Career Potential
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Navigate your educational and career journey with confidence, backed by expert guidance and personalized support
          </p>
        </div>
      </section>

      {/* Header */}
      <header className="flex justify-between items-center mb-8 relative">
        <div className="w-full SearchBar">
          <SearchBar placeholder="find mentor, academic programs, careers, universities, scholarships..." />
        </div>
      </header>
      
      {/* Mentee CTA Section */}
      <section className="mb-12 py-12 px-8 rounded-xl relative overflow-hidden mentee-cta">
        {/* Glass effect with light blue background */}
        <div className="absolute inset-0 bg-primary/90 opacity-90"></div>
        <div className="absolute inset-0 backdrop-blur-sm bg-white/10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 max-w-6xl mx-auto p-4">
          <div className="text-white space-y-4 text-center md:text-left md:max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold">Find Your Perfect Mentor</h2>
            <p className="text-white/90">
              Connect with experts who've walked the path you aspire to follow
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-white/90 space-y-1.5">
              <li>Get college admissions guidance for US & European schools</li>
              <li>Discover scholarship and financial aid opportunities</li>
              <li>Connect with graduates from your dream institutions</li>
              <li>Receive personalized career direction from professionals</li>
              <li>Explore your ideal path with our AI Career Guide</li>
            </ul>
          </div>
          
          <div className="flex flex-col items-center space-y-4 md:ml-auto">
            <div className="relative w-52 h-52 mb-2 hidden md:block">
              <img 
                src="/lovable-uploads/2f911e17-c410-44bf-bd05-1243e9536612.png" 
                alt="Mentor guiding student" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            {isLoggedIn ? (
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-700 hover:bg-white/90 font-semibold px-8 py-6 h-auto text-lg shadow-lg group transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <Link to="/mentor" className="flex items-center gap-2">
                  <UserSearch className="w-5 h-5 transition-transform group-hover:rotate-12" />
                  Find a Mentor
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-700 hover:bg-white/90 font-semibold px-8 py-6 h-auto text-lg shadow-lg group transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <Link to="/auth?tab=signup" className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 transition-transform group-hover:rotate-12" />
                  Become a Mentee
                </Link>
              </Button>
            )}
            <p className="text-white/90 text-sm">
              {isLoggedIn ? "Browse our expert mentors" : "Free sign-up • Start your journey today"}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-24">
        <Slides />
      </section>
    </>
  );
};
