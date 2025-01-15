import { GraduationCap, Users2, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ServicesSection() {
  const services = [
    {
      icon: GraduationCap,
      title: "Academic Guidance",
      description: "Navigate your educational journey with expert advice on majors, courses, and academic pathways aligned with your career goals."
    },
    {
      icon: Users2,
      title: "1-on-1 Mentorship",
      description: "Connect with experienced professionals for personalized guidance, career advice, and industry insights through our mentorship program."
    },
    {
      icon: Briefcase,
      title: "Career Exploration",
      description: "Discover diverse career paths and opportunities through our comprehensive database of professions, complete with detailed insights and requirements."
    }
  ];

  return (
    <section className="text-center mb-16">
      <h2 className="text-3xl font-bold mb-8">Our Services</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-8 pb-6 px-6 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-picocareer-primary to-picocareer-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}