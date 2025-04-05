
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RobotAvatar } from '@/components/career-chat/robot-avatar/RobotAvatar';
import { Brain, Check, ChevronRight, MessageCircle, Star, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function AIAssessmentSection() {
  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-[#0EA5E9] to-[#0284c7] rounded-3xl overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0EA5E9]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0EA5E9]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#38BDF8]/30 rounded-full blur-xl" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left column with avatar and title */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative mb-8">
                <div className="absolute -top-4 -right-4 bg-white text-[#0EA5E9] text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-lg">
                  New!
                </div>
                <RobotAvatar size="xl" showSpeechBubble isAnimated={true} />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white">
                AI-Powered Career Assessment
              </h2>
              
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
                Discover your ideal career path with our intelligent assessment powered by 
                advanced AI. Get personalized recommendations based on your unique skills and interests.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Check className="h-5 w-5 text-white" />
                  <span className="font-medium text-white">Personalized Results</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Brain className="h-5 w-5 text-white" />
                  <span className="font-medium text-white">AI-Powered Insights</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-white" />
                  <span className="font-medium text-white">Skill Matching</span>
                </div>
              </div>
              
              <Button 
                asChild 
                size="lg" 
                className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-semibold gap-2 shadow-lg border border-white/30 transition-all group"
              >
                <Link to="/career-chat">
                  Start Your Assessment
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right column with feature cards */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px]">
                <CardContent className="p-6">
                  <div className="bg-[#0EA5E9]/20 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Conversational Experience</h3>
                  <p className="text-white/80">
                    Chat naturally with our AI assistant instead of filling out lengthy forms.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px]">
                <CardContent className="p-6">
                  <div className="bg-[#0EA5E9]/20 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Career Match Scoring</h3>
                  <p className="text-white/80">
                    Get personalized career matches with compatibility scores.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px] sm:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#0EA5E9] h-14 w-14 rounded-full flex items-center justify-center shrink-0 shadow-md">
                      <Star className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-white">Start your career journey today</h3>
                      <p className="text-white/80">
                        Join thousands of users who have discovered their ideal career path.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
