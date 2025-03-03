
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Briefcase, GraduationCap, Target, MessagesSquare, Users, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  
  // Get styles based on category
  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case 'education':
        return {
          gradientClass: 'from-indigo-100/70 to-white',
          borderClass: 'border-indigo-200',
          textClass: 'text-indigo-700',
          iconColor: 'text-indigo-500',
          progressColorClass: 'bg-indigo-500'
        };
      case 'skills':
        return {
          gradientClass: 'from-emerald-100/70 to-white',
          borderClass: 'border-emerald-200',
          textClass: 'text-emerald-700',
          iconColor: 'text-emerald-500',
          progressColorClass: 'bg-emerald-500'
        };
      case 'workstyle':
        return {
          gradientClass: 'from-amber-100/70 to-white',
          borderClass: 'border-amber-200',
          textClass: 'text-amber-700',
          iconColor: 'text-amber-500',
          progressColorClass: 'bg-amber-500'
        };
      case 'goals':
        return {
          gradientClass: 'from-blue-100/70 to-white',
          borderClass: 'border-blue-200',
          textClass: 'text-blue-700',
          iconColor: 'text-blue-500',
          progressColorClass: 'bg-blue-500'
        };
      case 'environment':
        return {
          gradientClass: 'from-violet-100/70 to-white',
          borderClass: 'border-violet-200',
          textClass: 'text-violet-700',
          iconColor: 'text-violet-500',
          progressColorClass: 'bg-violet-500'
        };
      default:
        return {
          gradientClass: 'from-gray-100/70 to-white',
          borderClass: 'border-gray-200',
          textClass: 'text-gray-700',
          iconColor: 'text-gray-500',
          progressColorClass: 'bg-primary'
        };
    }
  };
  
  // Get icon based on category
  const getCategoryIcon = (cat: string) => {
    const styles = getCategoryStyles(cat);
    
    switch (cat) {
      case 'education':
        return <GraduationCap className={cn("h-5 w-5", styles.iconColor)} />;
      case 'skills':
        return <Brain className={cn("h-5 w-5", styles.iconColor)} />;
      case 'workstyle':
        return <MessagesSquare className={cn("h-5 w-5", styles.iconColor)} />;
      case 'goals':
        return <Target className={cn("h-5 w-5", styles.iconColor)} />;
      case 'environment':
        return <Users className={cn("h-5 w-5", styles.iconColor)} />;
      default:
        return <Briefcase className={cn("h-5 w-5", styles.iconColor)} />;
    }
  };

  // Format progress display
  const formattedProgress = Math.round(progress);
  const progressStatus = formattedProgress < 20 ? 'Just Starting' : 
                         formattedProgress < 40 ? 'Making Progress' :
                         formattedProgress < 60 ? 'Getting There' :
                         formattedProgress < 80 ? 'Going Well' :
                         formattedProgress < 100 ? 'Almost Done' : 'Complete';
                         
  const styles = getCategoryStyles(category);

  return (
    <Card className={cn(
      "w-full max-w-2xl mb-2 shadow-sm hover:shadow transition-all duration-300 animate-fade-in", 
      `bg-gradient-to-br ${styles.gradientClass}`,
      `border ${styles.borderClass}`
    )}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          {getCategoryIcon(category)}
          <CardTitle className={cn("text-base font-medium", styles.textClass)}>
            {formatCategory(category)} • Q{questionNumber}/{totalQuestions}
          </CardTitle>
        </div>
        <div className="flex flex-col items-end">
          <span className={cn(
            "text-xs px-2.5 py-1 rounded-full font-medium",
            `bg-${styles.progressColorClass.split('-')[1]}-100`,
            styles.textClass
          )}>
            {formattedProgress}%
          </span>
          <span className="text-xs text-gray-500 mt-1">{progressStatus}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {intro && <p className="text-sm text-gray-600 mb-3">{intro}</p>}
        <h3 className="text-lg font-medium text-gray-800 mb-4">{question}</h3>
        <Progress 
          value={progress} 
          className={cn("h-1.5 bg-gray-100", styles.progressColorClass)} 
        />
      </CardContent>
    </Card>
  );
}
