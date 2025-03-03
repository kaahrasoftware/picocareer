
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, GraduationCap, Brain, Star, MessagesSquare, Target, Briefcase, Minimize2, Menu } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ChatHeaderProps {
  isAnalyzing?: boolean;
  currentCategory?: string | null;
  onMinimize?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function ChatHeader({ 
  isAnalyzing = false, 
  currentCategory = null,
  onMinimize,
  onToggleSidebar,
  isSidebarOpen = true
}: ChatHeaderProps) {
  const getCategoryIcon = () => {
    switch (currentCategory) {
      case 'education':
        return <GraduationCap className="h-5 w-5 text-indigo-500" />;
      case 'skills':
        return <Brain className="h-5 w-5 text-emerald-500" />;
      case 'workstyle':
        return <MessagesSquare className="h-5 w-5 text-amber-500" />;
      case 'goals':
        return <Target className="h-5 w-5 text-primary" />;
      case 'complete':
        return <Star className="h-5 w-5 text-amber-400" />;
      default:
        return <Briefcase className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryTitle = () => {
    switch (currentCategory) {
      case 'education':
        return 'Educational Background';
      case 'skills':
        return 'Skills Assessment';
      case 'workstyle':
        return 'Work Style Preferences';
      case 'goals':
        return 'Career Aspirations';
      case 'complete':
        return 'Career Recommendations';
      default:
        return 'Career Chat';
    }
  };

  return (
    <div className="p-3 bg-white shadow-sm border-b">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && onToggleSidebar && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-1">
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {isAnalyzing ? (
            <>
              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="h-3 w-3 text-primary animate-pulse" />
              </div>
              <h2 className="font-medium">Analyzing your responses...</h2>
            </>
          ) : (
            <>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                {currentCategory ? getCategoryIcon() : <Bot className="h-5 w-5 text-primary" />}
              </div>
              <h2 className="font-medium">{getCategoryTitle()}</h2>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {isAnalyzing && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full hidden sm:inline-block">
              Generating personalized recommendations
            </span>
          )}
          
          {onMinimize && (
            <Button variant="ghost" size="icon" onClick={onMinimize} title="Minimize">
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {isAnalyzing && (
        <div className="mt-2">
          <Progress value={50} className="h-1.5 animate-pulse" />
        </div>
      )}
    </div>
  );
}
