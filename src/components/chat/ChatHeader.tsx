
import React from 'react';
import { GraduationCap, Brain, Star, MessagesSquare, Target, Briefcase, Check, CheckCircle, X, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RobotAvatar } from '@/components/career-chat/robot-avatar/RobotAvatar';

interface ChatHeaderProps {
  isAnalyzing?: boolean;
  currentCategory?: string | null;
  questionProgress?: number;
  isSessionComplete?: boolean;
  onEndSession?: () => void;
  onDownloadResults?: () => void;
}

export function ChatHeader({ 
  isAnalyzing = false, 
  currentCategory = null, 
  questionProgress = 0,
  isSessionComplete = false,
  onEndSession,
  onDownloadResults
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
        return isSessionComplete 
          ? <CheckCircle className="h-5 w-5 text-green-500" />
          : <Star className="h-5 w-5 text-amber-400" />;
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
        return isSessionComplete 
          ? 'Assessment Complete'
          : 'Career Recommendations';
      default:
        return 'Career Chat';
    }
  };

  const getCategoryColor = () => {
    switch (currentCategory) {
      case 'education':
        return 'bg-indigo-50 border-indigo-100';
      case 'skills':
        return 'bg-emerald-50 border-emerald-100';
      case 'workstyle':
        return 'bg-amber-50 border-amber-100';
      case 'goals':
        return 'bg-blue-50 border-blue-100';
      case 'complete':
        return isSessionComplete 
          ? 'bg-green-50 border-green-100'
          : 'bg-purple-50 border-purple-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className={`${getCategoryColor()} border-b shadow-sm transition-all duration-300`}>
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isAnalyzing ? (
            <>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="font-medium">Analyzing your responses...</h2>
                <p className="text-xs text-muted-foreground">Finding the best career matches for you</p>
              </div>
            </>
          ) : (
            <>
              <div className={`h-8 w-8 rounded-full ${isSessionComplete && currentCategory === 'complete' ? 'bg-green-100' : 'bg-primary/10'} flex items-center justify-center`}>
                {currentCategory ? getCategoryIcon() : <RobotAvatar size="sm" />}
              </div>
              <div>
                <h2 className="font-medium">{getCategoryTitle()}</h2>
                {currentCategory && !isSessionComplete && currentCategory !== 'complete' && (
                  <p className="text-xs text-muted-foreground">
                    {currentCategory === 'education' && "Tell us about your educational journey"}
                    {currentCategory === 'skills' && "Share your strengths and abilities"}
                    {currentCategory === 'workstyle' && "How do you prefer to work?"}
                    {currentCategory === 'goals' && "What are you looking for in a career?"}
                  </p>
                )}
                
                {isSessionComplete && currentCategory === 'complete' && (
                  <div className="flex items-center">
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Complete
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          {!isSessionComplete && !isAnalyzing && onEndSession && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
              onClick={onEndSession}
            >
              <X className="h-4 w-4" />
              End Session
            </Button>
          )}
          
          {isSessionComplete && onDownloadResults && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5"
              onClick={onDownloadResults}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>
      
      {!isAnalyzing && questionProgress > 0 && questionProgress < 100 && (
        <div className="px-3 pb-2">
          <Progress value={questionProgress} className="h-1.5" />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {questionProgress}% complete
            </span>
          </div>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="px-3 pb-2">
          <Progress value={50} className="h-1.5 animate-pulse" />
        </div>
      )}
      
      {isSessionComplete && currentCategory === 'complete' && (
        <div className="px-3 pb-2">
          <Progress value={100} className="h-1.5 bg-green-100" />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-green-600">
              100% complete
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
