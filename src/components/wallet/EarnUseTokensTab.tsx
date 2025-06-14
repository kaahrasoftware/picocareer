
import { Gift, UserPlus, Calendar, Users, GraduationCap, BookOpen, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EarnUseTokensTab() {
  const earnMethods = [
    {
      icon: Gift,
      title: "Daily Login",
      description: "Log in daily to earn tokens",
      tokens: "5 tokens/day",
      color: "text-green-600"
    },
    {
      icon: UserPlus,
      title: "Refer Friends",
      description: "Invite friends and earn when they register",
      tokens: "15 tokens/invite",
      color: "text-blue-600"
    },
    {
      icon: Calendar,
      title: "Attend Events",
      description: "Join webinars, workshops, and coffee chats",
      tokens: "25-100 tokens",
      color: "text-purple-600"
    }
  ];

  const useMethods = [
    {
      icon: Users,
      title: "Mentorship Sessions",
      description: "Book one-on-one sessions with mentors",
      tokens: "25 tokens",
      color: "text-orange-600"
    },
    {
      icon: GraduationCap,
      title: "Premium Webinars",
      description: "Access exclusive workshops and webinars",
      tokens: "Varies",
      color: "text-indigo-600"
    },
    {
      icon: BookOpen,
      title: "Premium Content",
      description: "Unlock scholarships, opportunities, careers, majors, universities, and hubs",
      tokens: "Varies",
      color: "text-emerald-600"
    },
    {
      icon: Star,
      title: "AI Career Assessments",
      description: "Access Pico AI career assessment tools",
      tokens: "25 tokens",
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* How to Earn Tokens Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">How to Earn Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {earnMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <method.icon className={`h-6 w-6 ${method.color}`} />
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-3">
                  {method.description}
                </p>
                <div className="bg-muted/50 rounded-lg px-3 py-2">
                  <span className="font-semibold text-primary">{method.tokens}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How to Use Tokens Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">How to Use Your Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <method.icon className={`h-6 w-6 ${method.color}`} />
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-3">
                  {method.description}
                </p>
                <div className="bg-muted/50 rounded-lg px-3 py-2">
                  <span className="font-semibold text-primary">{method.tokens}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
