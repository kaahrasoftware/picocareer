import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RobotAvatar } from '@/components/career-chat/robot-avatar/RobotAvatar';
import { Brain, ChevronRight, MessageCircle, Target } from 'lucide-react';
export function AIAssessmentSection() {
  return <div className="w-full py-16 md:py-24 relative overflow-hidden rounded-xl mx-4">
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative mb-6">
            <div className="absolute -top-2 -right-2 bg-white text-[#0EA5E9] text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-md">
              New!
            </div>
            <RobotAvatar size="lg" showSpeechBubble isAnimated={true} />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            AI-Powered Career Assessment
          </h2>
          
          <p className="text-lg text-white/90 mb-8 max-w-xl">
            Find your ideal career path with personalized recommendations based on your unique skills and interests.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px]">
            <div className="bg-[#0EA5E9]/20 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Conversational Experience</h3>
            <p className="text-white/80 text-sm">
              Chat naturally with our AI assistant instead of filling out lengthy forms.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px]">
            <div className="bg-[#0EA5E9]/20 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Career Match Scoring</h3>
            <p className="text-white/80 text-sm">
              Get personalized career matches with compatibility scores.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px]">
            <div className="bg-[#0EA5E9]/20 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">AI-Powered Insights</h3>
            <p className="text-white/80 text-sm">
              Discover career paths perfectly suited to your personality and skills.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button asChild size="lg" className="bg-white hover:bg-white/90 text-[#0EA5E9] font-semibold gap-2 shadow-lg transition-all group">
            <Link to="/career-chat">
              Start Your Assessment
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>;
}