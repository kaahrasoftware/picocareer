
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, MessageCircle, TrendingUp, Users, Sparkles, ArrowRight } from 'lucide-react';

interface CareerChatWelcomeProps {
  onStartAssessment: () => void;
  onViewPastSessions: () => void;
  hasPastSessions: boolean;
}

export function CareerChatWelcome({ onStartAssessment, onViewPastSessions, hasPastSessions }: CareerChatWelcomeProps) {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your responses to find perfect career matches"
    },
    {
      icon: MessageCircle,
      title: "Interactive Conversation",
      description: "Natural chat flow that adapts to your answers and interests"
    },
    {
      icon: TrendingUp,
      title: "Growth Insights",
      description: "Discover skills to develop and career paths to explore"
    },
    {
      icon: Users,
      title: "Personalized Results",
      description: "Get recommendations tailored specifically to your profile"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>
          <div className="relative">
            <Sparkles className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Discover Your Perfect Career
            </h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              Take our intelligent career assessment and unlock personalized recommendations 
              tailored to your skills, interests, and aspirations.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={onStartAssessment}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Career Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {hasPastSessions && (
            <Button 
              onClick={onViewPastSessions}
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg"
            >
              View Past Assessments
            </Button>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats or Progress Indicator */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ⏱️ Takes 5-10 minutes • 🎯 Personalized results • 🔒 Your data is secure
        </p>
      </div>
    </div>
  );
}
