
import { Link } from "react-router-dom";
import { Rocket, Award, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResourcesHighlightSection() {
  const resources = [
    {
      title: "Scholarships",
      description: "Find scholarships and financial aid opportunities to fund your education",
      icon: Award,
      path: "/scholarships",
      gradient: "from-blue-500 to-blue-700"
    },
    {
      title: "Opportunities",
      description: "Discover internships, jobs, and other career development opportunities",
      icon: Rocket,
      path: "/opportunities",
      gradient: "from-purple-500 to-purple-700"
    },
    {
      title: "Events",
      description: "Join workshops, webinars, and networking events in your field",
      icon: Calendar,
      path: "/event",
      gradient: "from-emerald-500 to-emerald-700"
    }
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explore Resources</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access valuable resources to support your academic and professional journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <Link
              key={resource.path}
              to={resource.path}
              className="group relative overflow-hidden rounded-2xl p-8 transition-transform hover:-translate-y-1"
            >
              <div className={cn(
                "absolute inset-0 opacity-90 bg-gradient-to-br",
                resource.gradient
              )} />
              <div className="relative z-10 flex flex-col items-center text-white text-center space-y-4">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <resource.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold">{resource.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {resource.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
