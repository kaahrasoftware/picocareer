
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, Award, ChevronRight, Calendar, DollarSign } from "lucide-react";

const mentorTabs = [
  {
    id: "overview",
    label: "Overview",
    icon: Star,
    content: {
      title: "Make a Real Impact",
      description: "Join our community of mentors and help shape the next generation of professionals. Share your expertise, guide career decisions, and make a lasting difference.",
      features: [
        "Flexible scheduling that fits your lifestyle",
        "Meaningful connections with ambitious students",
        "Professional development opportunities",
        "Recognition in our mentor community"
      ],
      stats: [
        { icon: Users, label: "Active Mentors", value: "2,500+" },
        { icon: Clock, label: "Sessions Completed", value: "15,000+" },
        { icon: Award, label: "Success Stories", value: "1,200+" }
      ]
    }
  },
  {
    id: "earnings",
    label: "Earnings",
    icon: DollarSign,
    content: {
      title: "Earn While You Impact",
      description: "Turn your expertise into a rewarding income stream. Set your own rates and build a sustainable mentoring practice.",
      features: [
        "Competitive hourly rates ($50-$200/hour)",
        "Keep 85% of your session fees",
        "Weekly payouts via Stripe",
        "Performance bonuses and incentives"
      ],
      stats: [
        { icon: DollarSign, label: "Average Hourly Rate", value: "$95" },
        { icon: Calendar, label: "Sessions Per Week", value: "8-12" },
        { icon: Award, label: "Top Mentor Earnings", value: "$5,000+/mo" }
      ]
    }
  },
  {
    id: "process",
    label: "How It Works",
    icon: ChevronRight,
    content: {
      title: "Simple 3-Step Process",
      description: "Getting started as a mentor is straightforward. We've streamlined the process to get you connected with students quickly.",
      features: [
        "Complete your mentor profile and verification",
        "Set your availability and session preferences",
        "Start receiving bookings from students",
        "Build long-term mentoring relationships"
      ],
      stats: [
        { icon: Clock, label: "Profile Setup", value: "15 min" },
        { icon: Users, label: "Approval Time", value: "2-3 days" },
        { icon: Calendar, label: "First Session", value: "Within 1 week" }
      ]
    }
  }
];

export function MentorTabsSection() {
  const [activeTab, setActiveTab] = useState("overview");
  const currentTab = mentorTabs.find(tab => tab.id === activeTab);

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Mentor with PicoCareer?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join a platform that values your expertise and makes mentoring rewarding, 
            both personally and financially.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {mentorTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {currentTab && (
          <div className="max-w-6xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">
                      {currentTab.content.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                      {currentTab.content.description}
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      {currentTab.content.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <a
                      href="/mentor-registration"
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                    >
                      <span>Start Mentoring Today</span>
                      <ChevronRight className="w-5 h-5" />
                    </a>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid gap-6">
                    {currentTab.content.stats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-white to-blue-50 p-6 rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow duration-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                              <Icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-gray-900">
                                {stat.value}
                              </div>
                              <div className="text-gray-600">{stat.label}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Join 2,500+ Professional Mentors
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ready to make an impact? Our team reviews applications within 48 hours 
            and provides full onboarding support to ensure your success.
          </p>
        </div>
      </div>
    </section>
  );
}
