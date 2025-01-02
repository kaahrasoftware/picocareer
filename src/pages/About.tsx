import { Target, Flag, Users, GraduationCap, Briefcase, Users2 } from "lucide-react";
import ServicesSection from "@/components/about/ServicesSection";
import MissionVisionSection from "@/components/about/MissionVisionSection";
import ValuesSection from "@/components/about/ValuesSection";
import TeamSection from "@/components/about/TeamSection";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-picocareer-dark to-picocareer-primary opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4 px-4">
            <h1 className="text-5xl font-bold">About PicoCareer</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Empowering the next generation of professionals through guidance and mentorship
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid gap-12">
          <ServicesSection />
          <MissionVisionSection />
          <ValuesSection />
          <TeamSection />
        </div>
      </div>
    </div>
  );
}