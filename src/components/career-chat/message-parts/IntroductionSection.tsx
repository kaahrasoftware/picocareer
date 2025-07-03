
import React from 'react';
import { cn } from '@/lib/utils';
import { GraduationCap, Brain, MessagesSquare, Target, Briefcase } from 'lucide-react';

interface IntroductionSectionProps {
  title: string;
  summary: string;
  category?: string;
}

export function IntroductionSection({ title, summary, category }: IntroductionSectionProps) {
  // Define category-specific styles and icons
  const getCategoryStyles = () => {
    switch (category) {
      case 'education':
        return "from-indigo-50 to-blue-50 border-indigo-100";
      case 'skills':
        return "from-emerald-50 to-green-50 border-emerald-100";
      case 'workstyle':
        return "from-amber-50 to-yellow-50 border-amber-100";
      case 'goals':
        return "from-blue-50 to-sky-50 border-blue-100";
      case 'personality':
        return "from-purple-50 to-violet-50 border-purple-100";
      default:
        return "from-blue-50 to-indigo-50 border-blue-100";
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'education':
        return <GraduationCap className="h-5 w-5 text-indigo-500" />;
      case 'skills':
        return <Brain className="h-5 w-5 text-emerald-500" />;
      case 'workstyle':
        return <MessagesSquare className="h-5 w-5 text-amber-500" />;
      case 'goals':
        return <Target className="h-5 w-5 text-blue-500" />;
      default:
        return <Briefcase className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className={cn(
      "bg-gradient-to-r p-5 rounded-lg shadow-sm border mb-4",
      getCategoryStyles()
    )}>
      <div className="flex items-start gap-3">
        <div className="bg-white p-2 rounded-full shadow-sm">
          {getCategoryIcon()}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600">{summary}</p>
        </div>
      </div>
    </div>
  );
}
