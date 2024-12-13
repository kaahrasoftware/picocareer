import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";

export const HeroSection = () => {
  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center mb-12 relative">
        <div className="w-full">
          <SearchBar placeholder="search here..." />
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-picocareer-secondary to-picocareer-primary bg-clip-text text-transparent">
          Welcome to PicoCareer!
        </h1>
        <Slides />
      </section>
    </>
  );
};