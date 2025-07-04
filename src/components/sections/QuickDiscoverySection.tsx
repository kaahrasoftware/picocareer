
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Users, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickDiscoverySection = () => {
  const quickActions = [
    {
      icon: Brain,
      title: "Career Assessment",
      description: "Discover your ideal career path with our AI-powered assessment",
      href: "/career-assessment",
      color: "bg-gradient-to-br from-[#00A6D4] to-[#0095c1]",
      bgColor: "bg-[#00A6D4]/5 hover:bg-[#00A6D4]/10 border-[#00A6D4]/10",
      textColor: "text-[#00A6D4]"
    },
    {
      icon: Users,
      title: "Find Mentors",
      description: "Connect with expert mentors in your field of interest",
      href: "/mentor",
      color: "bg-gradient-to-br from-[#33b3d9] to-[#00A6D4]",
      bgColor: "bg-[#33b3d9]/5 hover:bg-[#33b3d9]/10 border-[#33b3d9]/10",
      textColor: "text-[#33b3d9]"
    },
    {
      icon: BookOpen,
      title: "Explore Programs",
      description: "Browse academic programs and degree options",
      href: "/program",
      color: "bg-gradient-to-br from-[#0095c1] to-[#008bb5]",
      bgColor: "bg-[#0095c1]/5 hover:bg-[#0095c1]/10 border-[#0095c1]/10",
      textColor: "text-[#0095c1]"
    },
    {
      icon: TrendingUp,
      title: "Career Paths",
      description: "Explore different career opportunities and requirements",
      href: "/career",
      color: "bg-gradient-to-br from-[#66c2e0] to-[#33b3d9]",
      bgColor: "bg-[#66c2e0]/5 hover:bg-[#66c2e0]/10 border-[#66c2e0]/10",
      textColor: "text-[#66c2e0]"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-[#00A6D4]/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Discovery</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Jump-start your journey with our most popular tools and resources
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {quickActions.map((action, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <CardContent className={`p-6 h-full ${action.bgColor} transition-colors border`}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 rounded-2xl ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className={`font-semibold text-lg ${action.textColor}`}>
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  
                  <Button 
                    asChild 
                    variant="ghost" 
                    className={`${action.textColor} hover:bg-white/50 group-hover:translate-x-1 transition-all duration-300`}
                  >
                    <Link to={action.href} className="flex items-center gap-2">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
