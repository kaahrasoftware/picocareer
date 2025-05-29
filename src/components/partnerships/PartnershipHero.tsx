import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles } from "lucide-react";
export function PartnershipHero() {
  const scrollToForm = () => {
    const formSection = document.getElementById('application-form');
    if (formSection) {
      formSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section className="relative overflow-hidden py-24 px-6">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10" />
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-sky-900" />
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative max-w-6xl mx-auto text-center text-white">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-amber-500" />
          <span className="font-medium tracking-wide text-amber-500">Transform Education Together</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Partner with <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-amber-500">PicoCareer</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed text-gray-200">
          Join our mission to transform career education and empower students worldwide. 
          Together, we can create pathways to meaningful careers and brighter futures.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" onClick={scrollToForm} className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-400 text-white font-semibold px-8 py-4 text-lg shadow-xl shadow-amber-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 border-0">
            Start Partnership Application
          </Button>
          
        </div>
        
        <div className="mt-16 animate-bounce">
          <ArrowDown className="h-8 w-8 mx-auto text-amber-500" />
        </div>
      </div>
    </section>;
}