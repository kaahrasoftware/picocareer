
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, Globe } from "lucide-react";

export function PartnershipHeader() {
  const scrollToForm = () => {
    const formElement = document.getElementById('partnership-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="text-center space-y-8 py-16">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Partner with PicoCareer
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Join us in shaping the future of career education and empowering the next generation of professionals
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 text-center py-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <span className="text-sm font-medium">10,000+ Students</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <span className="text-sm font-medium">500+ Mentors</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <span className="text-sm font-medium">Global Reach</span>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          size="lg" 
          onClick={scrollToForm}
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg"
        >
          Start Partnership Application
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="text-sm text-muted-foreground">
          Ready to make an impact? Let's build something amazing together.
        </p>
      </div>
    </section>
  );
}
