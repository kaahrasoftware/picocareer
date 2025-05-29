
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Globe, Users, BarChart, Network, BookOpen } from "lucide-react";

export function BenefitsOverview() {
  const benefits = [
    {
      title: "Curriculum Enrichment",
      description: "Integrate PicoCareer's comprehensive career support tools directly into your curriculum for enhanced student outcomes.",
      icon: GraduationCap,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Global Partnership Network",
      description: "Position your institution for strategic partnerships with universities and colleges worldwide through our network.",
      icon: Globe,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Community Building with Pico Hubs",
      description: "Build your community and strengthen your brand through alumni success stories and engagement platforms.",
      icon: Users,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Data-Driven Insights",
      description: "Track student engagement and outcomes with comprehensive analytics and actionable data insights.",
      icon: BarChart,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "International Visibility",
      description: "Gain visibility and recognition through our global network of mentors, students, and education professionals.",
      icon: Network,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Resource Library Access",
      description: "Access our extensive library of career resources, guides, and educational content for your students.",
      icon: BookOpen,
      color: "from-indigo-500 to-blue-500"
    }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Network className="h-4 w-4" />
            Partnership Benefits
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Transform Your Institution
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            When you partner with PicoCareer, you gain access to innovative tools and resources 
            designed to enhance educational outcomes and student success.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="group bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 shadow-lg"
            >
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${benefit.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-cyan-50 px-8 py-4 rounded-2xl border border-emerald-200">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-cyan-500 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-gray-700 font-medium">
              Join 500+ institutions already partnering with PicoCareer
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
