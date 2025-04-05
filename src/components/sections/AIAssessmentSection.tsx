
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RobotAvatar } from '@/components/career-chat/robot-avatar/RobotAvatar';
import { Brain, Check, ChevronRight, MessageCircle, Star, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function AIAssessmentSection() {
  return (
    <div className="w-full py-12 md:py-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-3xl overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left column with avatar and title */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative mb-6">
                <RobotAvatar size="xl" showSpeechBubble />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-picocareer-dark dark:text-white">
                AI-Powered Career Assessment
              </h2>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl">
                Discover career paths that match your unique skills, interests, and goals with our 
                intelligent career assessment powered by advanced AI technology.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                <div className="flex items-center gap-2 bg-white dark:bg-blue-900/30 shadow-sm px-4 py-2 rounded-full">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Personalized Results</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-blue-900/30 shadow-sm px-4 py-2 rounded-full">
                  <Brain className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">AI-Powered Insights</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-blue-900/30 shadow-sm px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">Skill Matching</span>
                </div>
              </div>
              
              <Button 
                asChild 
                size="lg" 
                className="bg-picocareer-primary hover:bg-blue-700 text-white gap-2 animate-pulse"
              >
                <Link to="/career-chat">
                  Start Your Assessment
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right column with feature cards */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-white/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-blue-100 dark:bg-blue-800/30 h-10 w-10 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Conversational Experience</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    No forms or endless questionnaires. Have a natural conversation with our AI assistant.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-blue-100 dark:bg-blue-800/30 h-10 w-10 rounded-full flex items-center justify-center mb-4">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Career Match Scoring</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get personalized career recommendations with match scores based on your unique profile.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow sm:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-12 w-12 rounded-full flex items-center justify-center shrink-0">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Start your career journey today</h3>
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
