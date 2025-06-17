
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Users, BarChart3, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export const PartnershipsCTASection = () => {
  const benefits = [
    {
      icon: Building2,
      title: "Curriculum Enrichment",
      description: "Integrate our comprehensive career guidance tools into your academic programs"
    },
    {
      icon: Users,
      title: "Global Network",
      description: "Connect your students with mentors and opportunities worldwide"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track student engagement and career development progress"
    },
    {
      icon: Globe,
      title: "International Focus",
      description: "Specialized support for international student success"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Transform Education Together
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Partner with PicoCareer to provide your students with world-class career guidance, 
              mentorship opportunities, and personalized educational pathways.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100 mb-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-slate-600">Educational Partners</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">50K+</div>
                <div className="text-slate-600">Students Supported</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">95%</div>
                <div className="text-slate-600">Partner Satisfaction</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-6 h-auto text-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Link to="/partnerships" className="flex items-center gap-2">
                Explore Partnership Opportunities
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <p className="text-slate-500 text-sm mt-4">
              Join leading institutions worldwide • Custom solutions available • No setup fees
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
