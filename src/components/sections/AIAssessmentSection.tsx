
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RobotAvatar } from '@/components/career-chat/robot-avatar/RobotAvatar';
import { Brain, Check, ChevronRight, MessageCircle, Star, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function AIAssessmentSection() {
  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-br from-blue-50 to-primary/5 dark:from-blue-950/40 dark:to-blue-900/20 rounded-3xl overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left column with avatar and title */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative mb-8">
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                  New!
                </div>
                <RobotAvatar size="xl" showSpeechBubble isAnimated={true} />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-gray-800 dark:text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                  AI-Powered Career Assessment
                </span>
              </h2>
              
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl">
                Discover your ideal career path with our intelligent assessment powered by 
                advanced AI. Get personalized recommendations based on your unique skills, 
                interests, and goals.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                <div className="flex items-center gap-2 bg-white dark:bg-white/10 shadow-sm px-4 py-2 rounded-full animate-fade-in" style={{animationDelay: "0.1s"}}>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Personalized Results</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-white/10 shadow-sm px-4 py-2 rounded-full animate-fade-in" style={{animationDelay: "0.2s"}}>
                  <Brain className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">AI-Powered Insights</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-white/10 shadow-sm px-4 py-2 rounded-full animate-fade-in" style={{animationDelay: "0.3s"}}>
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">Skill Matching</span>
                </div>
              </div>
              
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90 text-white gap-2 shadow-lg hover:shadow-xl transition-all group"
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
              <Card className="bg-white/80 dark:bg-white/5 border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]">
                <CardContent className="p-6">
                  <div className="bg-blue-50 dark:bg-blue-900/50 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Conversational Experience</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Chat naturally with our AI assistant instead of filling out lengthy forms or questionnaires.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 dark:bg-white/5 border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]">
                <CardContent className="p-6">
                  <div className="bg-blue-50 dark:bg-blue-900/50 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Career Match Scoring</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get personalized career matches with compatibility scores based on your unique profile.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 dark:bg-white/5 border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] sm:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-14 w-14 rounded-full flex items-center justify-center shrink-0 shadow-md">
                      <Star className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">Start your career journey today</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Join thousands of users who have discovered their ideal career path with our AI assistant.
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
