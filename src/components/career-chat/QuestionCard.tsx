
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Briefcase, GraduationCap, Target, MessagesSquare, Users, Clock, Settings } from 'lucide-react';

interface QuestionCardProps {
  question: string;
  intro?: string;
  category: string;
  questionNumber: number;
  totalQuestions: number;
  progress: number;
}

export function QuestionCard({ 
  question, 
  intro,
  category, 
  questionNumber, 
  totalQuestions,
  progress 
}: QuestionCardProps) {
  // Format category name for display
  const formatCategory = (cat: string) => {
    switch (cat) {
      case 'education':
        return 'Educational Background';
      case 'skills':
        return 'Skills Assessment';
      case 'workstyle':
        return 'Work Style Preferences';
      case 'goals':
        return 'Career Goals & Interests';
      case 'environment':
        return 'Work Environment';
      default:
        return cat.charAt(0).toUpperCase() + cat.slice(1);
    }
  };
  
  // Get icon based on category
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'education':
        return <GraduationCap className="h-4 w-4 text-indigo-500" />;
      case 'skills':
        return <Brain className="h-4 w-4 text-emerald-500" />;
      case 'workstyle':
        return <MessagesSquare className="h-4 w-4 text-amber-500" />;
      case 'goals':
        return <Target className="h-4 w-4 text-primary" />;
      case 'environment':
        return <Users className="h-4 w-4 text-violet-500" />;
      default:
        return <Briefcase className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format progress display
  const formattedProgress = Math.round(progress);
  const progressStatus = formattedProgress < 20 ? 'Just Starting' : 
                         formattedProgress < 40 ? 'Making Progress' :
                         formattedProgress < 60 ? 'Getting There' :
                         formattedProgress < 80 ? 'Going Well' :
                         formattedProgress < 100 ? 'Almost Done' : 'Complete';

  return (
    <Card className="w-full max-w-2xl mb-4 bg-white border border-blue-100 shadow-sm transition-all hover:shadow animate-fade-in">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {getCategoryIcon(category)}
          <CardTitle className="text-base font-medium text-gray-600">
            {formatCategory(category)} • Q{questionNumber}/{totalQuestions}
          </CardTitle>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
            {formattedProgress}%
          </span>
          <span className="text-xs text-gray-500 mt-1">{progressStatus}</span>
        </div>
      </CardHeader>
      <CardContent>
        {intro && <p className="text-sm text-gray-500 mb-2">{intro}</p>}
        <h3 className="text-lg font-medium text-gray-800 mb-3">{question}</h3>
        <Progress value={progress} className="h-1.5 bg-gray-100" />
      </CardContent>
    </Card>
  );
}
