
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, UserPlus, Calendar, Coffee, Users, GraduationCap, BookOpen, Star } from "lucide-react";

export function EarnUseTokensTab() {
  const earnMethods = [
    {
      icon: Gift,
      title: "Daily Login",
      description: "Sign in every day to earn tokens",
      tokens: "5 tokens/day",
      color: "text-green-600"
    },
    {
      icon: UserPlus,
      title: "Refer Friends",
      description: "Invite friends and earn tokens when they register",
      tokens: "15 tokens/invite",
      color: "text-blue-600"
    },
    {
      icon: Calendar,
      title: "Attend Webinars",
      description: "Register and attend webinars and workshops",
      tokens: "25-100 tokens",
      color: "text-purple-600"
    },
    {
      icon: Coffee,
      title: "Coffee Chats",
      description: "Join coffee chat sessions with peers",
      tokens: "25-50 tokens",
      color: "text-orange-600"
    }
  ];

  const useMethods = [
    {
      icon: Users,
      title: "Mentorship Sessions",
      description: "Book one-on-one sessions with mentors",
      tokens: "25 tokens",
      color: "text-indigo-600"
    },
    {
      icon: GraduationCap,
      title: "Premium Webinars",
      description: "Access exclusive webinars and workshops",
      tokens: "Varies",
      color: "text-emerald-600"
    },
    {
      icon: BookOpen,
      title: "Premium Content",
      description: "Unlock scholarships, careers, majors, and more",
      tokens: "Varies",
      color: "text-rose-600"
    },
    {
      icon: Star,
      title: "Pico AI Assessments",
      description: "Access our AI-powered career assessment tool",
      tokens: "25 tokens",
      color: "text-amber-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* How to Earn Tokens Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">How to Earn Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earnMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-gray-50 ${method.color}`}>
                    <method.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1">{method.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                    <span className={`text-sm font-semibold ${method.color}`}>
                      {method.tokens}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How to Use Tokens Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">How to Use Your Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-gray-50 ${method.color}`}>
                    <method.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1">{method.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                    <span className={`text-sm font-semibold ${method.color}`}>
                      {method.tokens}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Star className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Pro Tip</h4>
              <p className="text-sm text-blue-800">
                The more you engage with the platform, the more tokens you can earn! 
                Check back daily and participate in community events to maximize your token balance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
