
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, UserPlus, Coffee, Users, GraduationCap, BookOpen, Star, Gift, TrendingUp } from "lucide-react";

export function EarnUseTokensTab() {
  const earnMethods = [
    {
      icon: Calendar,
      title: "Daily Login",
      tokens: 5,
      description: "Log in every day to earn tokens",
      action: "streak"
    },
    {
      icon: UserPlus,
      title: "Refer Friends",
      tokens: 15,
      description: "Earn tokens for each registered invite",
      action: "invite"
    },
    {
      icon: Coffee,
      title: "Attend Events",
      tokens: "25-100",
      description: "Join webinars, workshops, and coffee chats",
      action: "events"
    },
    {
      icon: Gift,
      title: "Special Bonuses",
      tokens: "Varies",
      description: "Complete achievements and milestones",
      action: "bonus"
    }
  ];

  const useMethods = [
    {
      icon: Users,
      title: "Mentorship Sessions",
      description: "Book one-on-one sessions with experienced mentors",
      cost: "50-200 tokens"
    },
    {
      icon: GraduationCap,
      title: "Premium Events",
      description: "Access exclusive webinars and workshops",
      cost: "25-75 tokens"
    },
    {
      icon: BookOpen,
      title: "Premium Content",
      description: "Unlock scholarships, opportunities, careers, majors, universities, and hubs",
      cost: "10-50 tokens"
    },
    {
      icon: Star,
      title: "AI Career Assessments",
      description: "Get personalized career insights with Pico AI",
      cost: "30 tokens"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Earn Tokens Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            How to Earn Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earnMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <IconComponent className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{method.title}</h4>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        +{method.tokens}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Pro Tip</span>
            </div>
            <p className="text-sm text-green-700">
              Maintain a daily login streak and actively participate in events to maximize your token earnings!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Use Tokens Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            How to Use Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {useMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <IconComponent className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{method.title}</h4>
                      <Badge variant="outline" className="text-purple-600 border-purple-600">
                        {method.cost}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">Getting Started</span>
            </div>
            <p className="text-sm text-purple-700 mb-3">
              New to tokens? Start with these recommended actions:
            </p>
            <div className="space-y-1">
              <p className="text-xs text-purple-600">• Take a free AI career assessment to get familiar</p>
              <p className="text-xs text-purple-600">• Attend a free webinar to earn your first tokens</p>
              <p className="text-xs text-purple-600">• Book a mentorship session when you're ready</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
