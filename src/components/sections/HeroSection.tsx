import { SearchBar } from "@/components/SearchBar";
import { Slides } from "@/components/Slides";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const HeroSection = () => {
  const { onAuthClick } = useAuth();

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
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            onClick={onAuthClick}
            className="px-8"
          >
            Sign Up
          </Button>
          <Button 
            variant="secondary"
            className="px-8"
            onClick={() => onAuthClick('mentor')}
          >
            Become a Mentor
          </Button>
        </div>
        <Slides />
      </section>
    </>
  );
};