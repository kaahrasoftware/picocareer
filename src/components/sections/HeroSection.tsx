import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";
import { Slides } from "@/components/Slides";

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center mb-12 relative">
        <div className="w-full">
          <SearchBar
            placeholder="search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchResults query={searchQuery} onClose={() => setSearchQuery("")} />
        </div>
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