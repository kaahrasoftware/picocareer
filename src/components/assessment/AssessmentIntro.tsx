import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Users, Clock, Target, BookOpen, Briefcase, GraduationCap, User } from 'lucide-react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { AuthPromptDialog } from '@/components/auth/AuthPromptDialog';

interface AssessmentIntroProps {
  onStart: () => void;
}

export const AssessmentIntro = ({ onStart }: AssessmentIntroProps) => {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoints();
  const { session } = useAuthSession();
  const isAuthenticated = !!session?.user;
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'start' | 'history'>('start');

  const handleStartAssessment = () => {
    if (isAuthenticated) {
      onStart();
    } else {
      setAuthAction('start');
      setIsAuthDialogOpen(true);
    }
  };

  const handleViewHistory = () => {
    if (isAuthenticated) {
      navigate('/career-assessment/history');
    } else {
      setAuthAction('history');
      setIsAuthDialogOpen(true);
    }
  };

  const getDialogProps = () => {
    if (authAction === 'start') {
      return {
        title: "Start Your Career Assessment",
        description: "Create an account or sign in to take our personalized career assessment and discover your perfect career path.",
        redirectUrl: "/career-assessment"
      };
    } else {
      return {
        title: "View Assessment History",
        description: "Sign in to view your past career assessment results and track your progress over time.",
        redirectUrl: "/career-assessment/history"
      };
    }
  };

  return (
    <>
      <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
        <Card>
          <CardHeader className={isMobile ? 'pb-4' : ''}>
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
              <Brain className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
              Discover Your Perfect Career Path
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              Our AI-powered career assessment adapts to your unique situation, whether you're exploring 
              careers for the first time or looking to make a professional transition.
            </p>
            
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
              <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                <h3 className={`font-semibold flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                  <Target className="h-4 w-4" />
                  Personalized Questions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Questions tailored to your academic level and career stage for more relevant insights.
                </p>
              </div>
              
              <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                <h3 className={`font-semibold flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                  <Clock className="h-4 w-4" />
                  10-15 Minutes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quick assessment that adapts based on your responses for maximum efficiency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={isMobile ? 'pb-4' : ''}>
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
              <Users className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
              Designed for Every Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
              <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                <div className="flex items-start gap-3">
                  <BookOpen className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-600 mt-0.5`} />
                  <div>
                    <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Middle & High School Students</h4>
                    <p className="text-sm text-muted-foreground">Explore interests and discover potential career paths early</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <GraduationCap className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600 mt-0.5`} />
                  <div>
                    <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>College Students</h4>
                    <p className="text-sm text-muted-foreground">Align your major with career goals and plan your future</p>
                  </div>
                </div>
              </div>
              
              <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                <div className="flex items-start gap-3">
                  <Briefcase className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-600 mt-0.5`} />
                  <div>
                    <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Career Professionals</h4>
                    <p className="text-sm text-muted-foreground">Find new opportunities and plan career transitions</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-orange-600 mt-0.5`} />
                  <div>
                    <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Recent Graduates</h4>
                    <p className="text-sm text-muted-foreground">Navigate the transition from education to career</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={isMobile ? 'pb-4' : ''}>
            <CardTitle className={isMobile ? 'text-lg' : ''}>What You'll Get</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Personalized career recommendations based on your stage and interests</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Detailed information about salary, growth potential, and requirements</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Next steps and educational pathways for each career</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Related careers to explore and professional mentors to connect with</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'gap-4'} justify-center`}>
          <Button 
            onClick={handleStartAssessment} 
            size={isMobile ? "default" : "lg"} 
            className={`${isMobile ? 'w-full min-h-[48px]' : 'px-8'}`}
          >
            Start Assessment
          </Button>
          <Button 
            variant="outline" 
            onClick={handleViewHistory} 
            size={isMobile ? "default" : "lg"}
            className={isMobile ? 'w-full min-h-[48px]' : ''}
          >
            View Past Results
          </Button>
        </div>
      </div>

      <AuthPromptDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        {...getDialogProps()}
      />
    </>
  );
};
