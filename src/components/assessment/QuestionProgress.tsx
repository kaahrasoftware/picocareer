
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AssessmentQuestion } from '@/types/assessment';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { CheckCircle, Target, User } from 'lucide-react';

interface QuestionProgressProps {
  currentIndex: number;
  totalQuestions: number;
  currentQuestion: AssessmentQuestion;
  detectedProfileType?: string | null;
  profileDetectionCompleted: boolean;
}

const getProfileTypeInfo = (profileType: string | null) => {
  switch (profileType) {
    case 'middle_school':
      return { label: 'Middle School', color: 'bg-green-100 text-green-800', icon: '🎓' };
    case 'high_school':
      return { label: 'High School', color: 'bg-blue-100 text-blue-800', icon: '📚' };
    case 'college':
      return { label: 'College', color: 'bg-purple-100 text-purple-800', icon: '🎯' };
    case 'career_professional':
      return { label: 'Professional', color: 'bg-orange-100 text-orange-800', icon: '💼' };
    default:
      return null;
  }
};

export const QuestionProgress = ({ 
  currentIndex, 
  totalQuestions, 
  currentQuestion,
  detectedProfileType,
  profileDetectionCompleted 
}: QuestionProgressProps) => {
  const { isMobile } = useBreakpoints();
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const profileInfo = getProfileTypeInfo(detectedProfileType);

  return (
    <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className={`${isMobile ? 'h-3' : 'h-2'}`} />
      </div>

      {/* Profile Detection Status */}
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-wrap items-center gap-2'}`}>
        {profileDetectionCompleted && profileInfo ? (
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'space-x-2'}`}>
            <CheckCircle className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-600`} />
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Assessment personalized for:</span>
            {!isMobile && (
              <Badge className={profileInfo.color}>
                <span className="mr-1">{profileInfo.icon}</span>
                <User className="h-3 w-3 mr-1" />
                {profileInfo.label}
              </Badge>
            )}
          </div>
        ) : currentIndex === 0 ? (
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'space-x-2'}`}>
            <Target className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600`} />
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              {isMobile ? 'Determining your profile...' : 'Determining your profile to personalize questions...'}
            </span>
          </div>
        ) : (
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'space-x-2'}`}>
            <div className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`} />
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              {isMobile ? 'Analyzing profile...' : 'Analyzing your profile...'}
            </span>
          </div>
        )}
        {isMobile && profileDetectionCompleted && profileInfo && (
          <Badge className={`${profileInfo.color} self-start`}>
            <span className="mr-1">{profileInfo.icon}</span>
            <User className="h-3 w-3 mr-1" />
            {profileInfo.label}
          </Badge>
        )}
      </div>

      {/* Question Type Indicator - Hide on mobile to save space */}
      {!isMobile && currentQuestion && (
        <div className="text-xs text-muted-foreground">
          {currentQuestion.order <= 2 ? (
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Profile Detection Question
            </span>
          ) : profileDetectionCompleted ? (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Personalized Question
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Universal Question
            </span>
          )}
        </div>
      )}
    </div>
  );
};
