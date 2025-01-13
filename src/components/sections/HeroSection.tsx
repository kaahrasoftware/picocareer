import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";

export const HeroSection = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 flex items-center justify-center flex-wrap gap-2">
          <span className="bg-gradient-to-r from-picocareer-secondary to-picocareer-primary bg-clip-text text-transparent pt-3">
            Making Every Move Matter
          </span>
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