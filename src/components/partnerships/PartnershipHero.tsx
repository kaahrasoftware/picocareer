
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function PartnershipHero() {
  const scrollToForm = () => {
    const formSection = document.getElementById('application-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden py-20 px-6">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-90" />
      <div className="relative max-w-6xl mx-auto text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Partner with <span className="text-yellow-300">PicoCareer</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
          Join our mission to transform career education and empower students worldwide. 
          Together, we can create pathways to meaningful careers and brighter futures.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-semibold px-8 py-3"
            onClick={scrollToForm}
          >
            Start Partnership Application
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3"
          >
            Learn More
          </Button>
        </div>
        <div className="mt-12 animate-bounce">
          <ArrowDown className="h-8 w-8 mx-auto text-yellow-300" />
        </div>
      </div>
    </section>
  );
}
