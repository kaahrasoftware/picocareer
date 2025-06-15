
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, UserPlus, Calendar, Users, GraduationCap, BookOpen, Star } from "lucide-react";

interface EarnUseTokensTabProps {
  onNavigateToReferrals?: () => void;
}

export function EarnUseTokensTab({ onNavigateToReferrals }: EarnUseTokensTabProps) {
  const earnMethods = [
    {
      icon: Gift,
      title: "Daily Login",
      description: "Log in daily to receive your token reward",
      tokens: "5 tokens/day",
      color: "text-green-600"
    },
    {
      icon: UserPlus,
      title: "Referrals",
      description: "Invite friends who successfully register",
      tokens: "15 tokens each",
      color: "text-blue-600",
      action: onNavigateToReferrals ? "View Referrals" : undefined
    },
    {
      icon: Calendar,
      title: "Events & Webinars",
      description: "Attend workshops, coffee chats, and webinars",
      tokens: "25-100 tokens",
      color: "text-purple-600"
    }
  ];

  const useMethods = [
    {
      icon: Users,
      title: "Mentorship Sessions",
      description: "Book 1-on-1 sessions with verified mentors",
      tokens: "25 tokens",
      color: "text-orange-600"
    },
    {
      icon: GraduationCap,
      title: "Premium Webinars & Workshops",
      description: "Access exclusive educational content",
      tokens: "Varies",
      color: "text-indigo-600"
    },
    {
      icon: BookOpen,
      title: "Premium Content Access",
      description: "Unlock scholarships, opportunities, careers, majors, universities, and hubs",
      tokens: "Varies",
      color: "text-teal-600"
    },
    {
      icon: Star,
      title: "Pico AI Career Assessments",
      description: "Get personalized career insights and recommendations",
      tokens: "25 tokens",
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Earn Tokens Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-green-700">
            How to Earn Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {earnMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div key={method.title} className="flex flex-col items-start space-y-3 p-4 rounded-lg border bg-white/50">
                  <div className="flex items-center gap-3 w-full">
                    <Icon className={`h-6 w-6 ${method.color}`} />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{method.title}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      <p className={`text-sm font-semibold mt-1 ${method.color}`}>
                        {method.tokens}
                      </p>
                    </div>
                  </div>
                  {method.action && onNavigateToReferrals && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNavigateToReferrals}
                      className="w-full"
                    >
                      {method.action}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Use Tokens Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-blue-700">
            How to Use Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {useMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div key={method.title} className="flex items-start space-x-3 p-4 rounded-lg border bg-white/50">
                  <Icon className={`h-6 w-6 mt-1 ${method.color}`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{method.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    <p className={`text-sm font-semibold mt-2 ${method.color}`}>
                      {method.tokens}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Pro Tips</h3>
            <p className="text-sm text-gray-600">
              Log in daily and attend events regularly to maximize your token earnings. 
              Use tokens strategically for the most valuable experiences like mentorship sessions and AI assessments.
              Don't forget to share your referral link with friends for easy bonus tokens!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
