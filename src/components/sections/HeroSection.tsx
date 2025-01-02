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
            src="/lovable-uploads/65608658-2c3b-4eab-80f0-d9791cae7b50.png"
            alt="PicoCareer"
            className="h-18 ml-3" // Decreased height from h-20 to h-18
          />
        </h1>
        <Slides />
      </section>
    </>
  );
};