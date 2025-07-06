
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, User, Users, Globe } from 'lucide-react';

interface QuestionProgressProps {
  currentIndex: number;
  totalQuestions: number;
  currentQuestion: {
    order: number;
    profileType?: string[];
    targetAudience?: string[];
  };
  detectedProfileType: string | null;
  profileDetectionCompleted: boolean;
}

const getQuestionPhase = (order: number, profileDetectionCompleted: boolean) => {
  if (order <= 2) return 'detection';
  if (order >= 50) return 'universal';
  return 'personalized';
};

const getPhaseInfo = (phase: string) => {
  switch (phase) {
    case 'detection':
      return {
        label: 'Getting to Know You',
        icon: Brain,
        color: 'bg-blue-100 text-blue-800',
        description: 'These questions help us understand your current stage'
      };
    case 'personalized':
      return {
        label: 'Your Stage Questions',
        icon: User,
        color: 'bg-green-100 text-green-800',
        description: 'Questions tailored specifically for your stage'
      };
    case 'universal':
      return {
        label: 'General Preferences',
        icon: Globe,
        color: 'bg-purple-100 text-purple-800',
        description: 'Questions that help us understand your work preferences'
      };
    default:
      return {
        label: 'Assessment Questions',
        icon: Users,
        color: 'bg-gray-100 text-gray-800',
        description: 'Assessment in progress'
      };
  }
};

export const QuestionProgress = ({
  currentIndex,
  totalQuestions,
  currentQuestion,
  detectedProfileType,
  profileDetectionCompleted
}: QuestionProgressProps) => {
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const phase = getQuestionPhase(currentQuestion.order, profileDetectionCompleted);
  const phaseInfo = getPhaseInfo(phase);
  const Icon = phaseInfo.icon;

  const getProfileTypeLabel = (profileType: string | null) => {
    switch (profileType) {
      case 'middle_school':
        return 'Middle School Student';
      case 'high_school':
        return 'High School Student';
      case 'college':
        return 'College Student';
      case 'career_professional':
        return 'Career Professional';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Type Badge */}
      {detectedProfileType && (
        <div className="flex items-center justify-center">
          <Badge variant="secondary" className="px-3 py-1">
            <User className="h-3 w-3 mr-1" />
            {getProfileTypeLabel(detectedProfileType)}
          </Badge>
        </div>
      )}

      {/* Question Phase Indicator */}
      <div className="flex items-center justify-center space-x-2">
        <Badge className={phaseInfo.color}>
          <Icon className="h-3 w-3 mr-1" />
          {phaseInfo.label}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Phase Description */}
      <p className="text-xs text-center text-muted-foreground">
        {phaseInfo.description}
      </p>
    </div>
  );
};
