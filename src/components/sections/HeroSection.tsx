
import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export const HeroSection = () => {
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
      <section className="mb-12 py-10 px-6 rounded-xl relative overflow-hidden mentee-cta">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-picocareer-primary to-picocareer-dark opacity-90"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto">
          <div className="text-white space-y-4 text-center md:text-left md:max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold">Ready to Find Your Path?</h2>
            <p className="text-white/90">
              Join thousands of students connecting with experienced mentors who can guide you towards academic and career success.
            </p>
            <ul className="list-disc list-inside text-sm md:text-base text-white/80 space-y-1.5">
              <li>Receive expert guidance for college admissions in the US and Europe</li>
              <li>Connect with mentors who graduated from your dream schools</li>
              <li>Explore scholarships and financial aid opportunities</li>
              <li>Get personalized career advice from industry professionals</li>
              <li>Use our AI Career Guide to discover your ideal career path</li>
              <li>Access resources for test preparation and application essays</li>
            </ul>
          </div>
          
          <div className="flex flex-col items-center space-y-4 md:ml-auto">
            <div className="relative w-64 h-64 mb-2 hidden md:block">
              <img 
                src="/lovable-uploads/f2122040-63e7-4f46-8b7c-d7c748d45e28.png" 
                alt="Student guided by mentor" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <Button
              asChild
              size="lg"
              className="bg-white text-picocareer-dark hover:bg-white/90 font-semibold px-8 py-6 h-auto text-lg shadow-lg group transition-all duration-300 transform hover:scale-105"
            >
              <Link to="/auth?tab=signup" className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 transition-transform group-hover:rotate-12" />
                Become a Mentee
              </Link>
            </Button>
            <p className="text-white/80 text-sm">
              It's free to sign up and explore!
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
