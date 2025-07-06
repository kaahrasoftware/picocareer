
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, User, Globe, HelpCircle } from 'lucide-react';

interface QuestionTypeIndicatorProps {
  questionOrder: number;
  profileType?: string[];
  targetAudience?: string[];
  detectedProfileType?: string | null;
}

export const QuestionTypeIndicator = ({
  questionOrder,
  profileType,
  targetAudience,
  detectedProfileType
}: QuestionTypeIndicatorProps) => {
  const getQuestionType = () => {
    if (questionOrder <= 2) {
      return {
        type: 'Profile Detection',
        icon: Brain,
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        description: 'Helps us understand your current stage'
      };
    }
    
    if (questionOrder >= 50 && targetAudience?.includes('all')) {
      return {
        type: 'Universal',
        icon: Globe,
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        description: 'Applies to all users'
      };
    }
    
    if (profileType && profileType.length > 0) {
      const profileLabel = detectedProfileType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        type: `${profileLabel} Specific`,
        icon: User,
        color: 'bg-green-50 text-green-700 border-green-200',
        description: 'Tailored for your stage'
      };
    }
    
    return {
      type: 'Assessment',
      icon: HelpCircle,
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      description: 'General assessment question'
    };
  };

  const typeInfo = getQuestionType();
  const Icon = typeInfo.icon;

  return (
    <div className="mb-4">
      <Badge variant="outline" className={`${typeInfo.color} text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {typeInfo.type}
      </Badge>
      <p className="text-xs text-muted-foreground mt-1">{typeInfo.description}</p>
    </div>
  );
};
