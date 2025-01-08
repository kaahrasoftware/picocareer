import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";

export const HeroSection = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 flex items-center justify-center flex-wrap gap-2">
          <span className="bg-gradient-to-r from-picocareer-secondary to-picocareer-primary bg-clip-text text-transparent pt-3">
            Welcome to
          </span>
          <img 
            src="/lovable-uploads/65608658-2c3b-4eab-80f0-d9791cae7b50.png"
            alt="PicoCareer"
            className="h-12 md:h-16 lg:h-20 ml-0 md:ml-3"
          />
        </h1>
      </section>

      {/* Header */}
      <header className="flex justify-between items-center mb-16 relative">
        <div className="w-full">
          <SearchBar placeholder="find mentor, academic programs, careers, universities, scholarships..." />
        </div>
      </header>

      <section className="mb-24">
        <Slides />
      </section>
    </>
  );
};