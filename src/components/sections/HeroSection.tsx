
import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";

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
      <header className="flex justify-between items-center mb-16 relative">
        <div className="w-full SearchBar">
          <SearchBar placeholder="find mentor, academic programs, careers, universities, scholarships..." />
        </div>
      </header>

      <section className="mb-24">
        <Slides />
      </section>
    </>
  );
};
