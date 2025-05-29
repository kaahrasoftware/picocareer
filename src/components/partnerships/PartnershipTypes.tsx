
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PartnershipTypes() {
  const partnershipTypes = [
    {
      title: "Universities & Colleges",
      description: "Enhance career services with comprehensive career exploration tools and resources.",
      icon: "🎓",
      features: ["Career pathway mapping", "Student engagement analytics", "Alumni success tracking"]
    },
    {
      title: "High Schools",
      description: "Guide students towards informed college and career decisions early in their journey.",
      icon: "🏫",
      features: ["College prep resources", "Career exploration workshops", "Counselor training programs"]
    },
    {
      title: "Trade Schools",
      description: "Connect skilled trades with students seeking hands-on career opportunities.",
      icon: "🔧",
      features: ["Industry partnerships", "Skills assessment tools", "Job placement support"]
    },
    {
      title: "Organizations",
      description: "Partner with nonprofits, government agencies, and workforce development organizations.",
      icon: "🏢",
      features: ["Workforce development", "Community outreach", "Grant collaboration opportunities"]
    },
    {
      title: "Individual Educators",
      description: "Empower teachers and counselors with cutting-edge career education resources.",
      icon: "👨‍🏫",
      features: ["Professional development", "Curriculum integration", "Student success tracking"]
    },
    {
      title: "Industry Partners",
      description: "Connect your industry expertise with students exploring career paths.",
      icon: "⚡",
      features: ["Mentorship programs", "Industry insights", "Talent pipeline development"]
    }
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Partnership Opportunities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We work with diverse organizations to create meaningful career education experiences.
            Find the partnership type that aligns with your mission.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partnershipTypes.map((type, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardHeader className="text-center">
                <div className="text-4xl mb-4">{type.icon}</div>
                <CardTitle className="text-xl text-purple-900">{type.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{type.description}</p>
                <ul className="space-y-2">
                  {type.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
