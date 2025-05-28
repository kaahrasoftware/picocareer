
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, Trophy, Zap, Globe } from "lucide-react";

// Static benefits data
const staticBenefits = [
  {
    id: 1,
    title: "Brand Visibility",
    description: "Showcase your organization to thousands of students and professionals",
    icon: "star",
    category: "marketing"
  },
  {
    id: 2,
    title: "Talent Pipeline",
    description: "Connect directly with emerging talent in your industry",
    icon: "users",
    category: "recruitment"
  },
  {
    id: 3,
    title: "Industry Recognition",
    description: "Position your brand as a leader in career development",
    icon: "trophy",
    category: "reputation"
  },
  {
    id: 4,
    title: "Innovation Access",
    description: "Stay connected to the latest trends and innovations",
    icon: "zap",
    category: "innovation"
  },
  {
    id: 5,
    title: "Global Reach",
    description: "Expand your network across different regions and markets",
    icon: "globe",
    category: "expansion"
  }
];

const iconMap = {
  star: Star,
  users: Users,
  trophy: Trophy,
  zap: Zap,
  globe: Globe
};

const categoryColors = {
  marketing: "bg-blue-100 text-blue-800",
  recruitment: "bg-green-100 text-green-800",
  reputation: "bg-purple-100 text-purple-800",
  innovation: "bg-orange-100 text-orange-800",
  expansion: "bg-teal-100 text-teal-800"
};

export function PartnershipBenefits() {
  return (
    <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Partnership Benefits
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover the exclusive advantages of partnering with PicoCareer
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {staticBenefits.map((benefit) => {
            const IconComponent = iconMap[benefit.icon as keyof typeof iconMap];
            return (
              <Card key={benefit.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={categoryColors[benefit.category as keyof typeof categoryColors]}
                    >
                      {benefit.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-primary font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Included in partnership
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
