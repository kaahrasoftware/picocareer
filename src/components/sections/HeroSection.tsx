import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";

export const HeroSection = () => {
  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <SearchBar />
      </header>

      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-kahra-secondary to-kahra-primary bg-clip-text text-transparent">
          Welcome to Kahra!
        </h1>
        <Slides />
      </section>
    </>
  );
};