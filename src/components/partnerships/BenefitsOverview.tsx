
import { Card, CardContent } from "@/components/ui/card";

export function BenefitsOverview() {
  const benefits = [
    {
      title: "Enhanced Student Outcomes",
      description: "Improve career readiness and student success rates with data-driven insights.",
      icon: "📈"
    },
    {
      title: "Access to Resources",
      description: "Comprehensive career exploration tools, assessments, and educational content.",
      icon: "📚"
    },
    {
      title: "Professional Development",
      description: "Training and support for educators and career counselors.",
      icon: "🎯"
    },
    {
      title: "Analytics & Reporting",
      description: "Track engagement, outcomes, and success metrics across your programs.",
      icon: "📊"
    },
    {
      title: "Customization Options",
      description: "Tailor the platform to match your institution's branding and needs.",
      icon: "🎨"
    },
    {
      title: "Ongoing Support",
      description: "Dedicated partnership manager and technical support team.",
      icon: "🤝"
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Partnership Benefits
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            When you partner with PicoCareer, you gain access to a comprehensive suite of 
            tools and resources designed to enhance career education outcomes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
