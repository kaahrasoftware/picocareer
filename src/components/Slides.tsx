import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users2, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    title: "Career Exploration",
    description:
      "Discover your path, fuel your ambitions, and build the future you envision with our comprehensive career directory.",
    icon: Briefcase,
    gradient: "from-red-600 to-red-800",
    route: "/career"
  },
  {
    title: "1 on 1 Mentorship",
    description:
      "Unlock exclusive one-on-one sessions with expert mentors tailored to your individual queries, ensuring personalized guidance and invaluable insights.",
    icon: Users2,
    gradient: "from-picocareer-primary to-picocareer-dark",
    route: "/mentor"
  },
  {
    title: "Majors Exploration",
    description:
      "Navigate through diverse academic paths, discover your interests, and make informed decisions about your educational journey.",
    icon: GraduationCap,
    gradient: "from-emerald-600 to-teal-800",
    route: "/program"
  },
];

export const Slides = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">What We Do</h2>
        <p className="text-muted-foreground">
          Empowering your journey with clarity, connection, and confidence at every step.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {slides.map((slide, index) => (
          <Card 
            key={index} 
            className="group relative overflow-hidden backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate(slide.route)}
          >
            <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${slide.gradient}`} />
            <CardContent className="relative p-8">
              <div className="mb-6 flex justify-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <slide.icon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">{slide.title}</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                {slide.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};