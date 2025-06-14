
import { Gift, UserPlus, Calendar, Coffee, Users, GraduationCap, BookOpen, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EarnUseTokensTab() {
  const earnMethods = [
    {
      icon: Gift,
      title: "Daily Login",
      description: "Log in daily to earn tokens automatically",
      tokens: "5 tokens/day",
      color: "text-green-600"
    },
    {
      icon: UserPlus,
      title: "Refer Friends",
      description: "Invite friends and earn when they register",
      tokens: "15 tokens",
      color: "text-blue-600"
    },
    {
      icon: Calendar,
      title: "Attend Events",
      description: "Join webinars and workshops",
      tokens: "25-100 tokens",
      color: "text-purple-600"
    },
    {
      icon: Coffee,
      title: "Coffee Chats",
      description: "Participate in networking sessions",
      tokens: "25-50 tokens",
      color: "text-orange-600"
    }
  ];

  const useMethods = [
    {
      icon: Users,
      title: "Mentorship Sessions",
      description: "Book one-on-one sessions with mentors",
      cost: "Varies by mentor"
    },
    {
      icon: GraduationCap,
      title: "Premium Webinars",
      description: "Access exclusive educational content",
      cost: "10-50 tokens"
    },
    {
      icon: BookOpen,
      title: "Premium Content",
      description: "Unlock scholarships, opportunities, careers, majors, universities, and hubs",
      cost: "5-25 tokens"
    },
    {
      icon: Star,
      title: "Pico AI Assessments",
      description: "Access advanced career assessment tools",
      cost: "20-40 tokens"
    }
  ];

  return (
    <div className="space-y-6">
      {/* How to Earn Tokens Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">How to Earn Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earnMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-50 ${method.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">{method.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{method.description}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${method.color} bg-gray-50`}>
                        {method.tokens}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How to Use Tokens Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">How to Use Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">{method.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{method.description}</p>
                      <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium text-blue-600 bg-blue-50">
                        {method.cost}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-gray-900">💡 Tips to Maximize Your Tokens</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Log in daily to build up your token balance consistently</li>
            <li>• Refer multiple friends to boost your earnings quickly</li>
            <li>• Attend events regularly for the highest token rewards</li>
            <li>• Use tokens strategically for high-value content and sessions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
