import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";

export const HeroSection = () => {
  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center mb-12 relative">
        <div className="w-full">
          <SearchBar placeholder="find mentor, academic programs, careers, universities, scholarships..." />
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 flex items-center justify-center">
          <span className="bg-gradient-to-r from-picocareer-secondary to-picocareer-primary bg-clip-text text-transparent">
            Welcome to
          </span>
          <img 
            src="/lovable-uploads/a3331866-b437-412e-b2c6-7f602cb959ca.png"
            alt="PicoCareer"
            className="h-12 ml-3"
          />
        </h1>
        <Slides />
      </section>
    </>
  );
};