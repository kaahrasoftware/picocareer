
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
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      textColor: "text-purple-700"
    },
    {
      icon: Users,
      title: "Find Mentors",
      description: "Connect with expert mentors in your field of interest",
      href: "/mentor",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      textColor: "text-blue-700"
    },
    {
      icon: BookOpen,
      title: "Explore Programs",
      description: "Browse academic programs and degree options",
      href: "/program",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
      textColor: "text-green-700"
    },
    {
      icon: TrendingUp,
      title: "Career Paths",
      description: "Explore different career opportunities and requirements",
      href: "/career",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100",
      textColor: "text-orange-700"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50/30">
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
              <CardContent className={`p-6 h-full ${action.bgColor} transition-colors`}>
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
