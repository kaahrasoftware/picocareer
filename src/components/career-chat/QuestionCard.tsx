
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface QuestionCardProps {
  question: string;
  category: string;
  questionNumber: number;
  totalQuestions: number;
  progress: number;
}

export function QuestionCard({ 
  question, 
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
        return 'Skills & Technical Knowledge';
      case 'workstyle':
        return 'Work Style Preferences';
      case 'goals':
        return 'Career Goals';
      default:
        return cat.charAt(0).toUpperCase() + cat.slice(1);
    }
  };

  return (
    <Card className="w-full max-w-2xl mb-4 bg-white border border-blue-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-gray-600">
          {formatCategory(category)} • Question {questionNumber}/{totalQuestions}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-medium text-gray-800 mb-2">{question}</h3>
        <Progress value={progress} className="h-1.5 bg-gray-100" />
      </CardContent>
    </Card>
  );
}
