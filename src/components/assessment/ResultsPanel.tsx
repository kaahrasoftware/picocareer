
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CareerRecommendationCard } from './CareerRecommendationCard';
import { AssessmentSummary } from './AssessmentSummary';
import { CareerRecommendation, QuestionResponse } from '@/types/assessment';
import { useSaveRecommendations } from '@/hooks/useSaveRecommendations';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { 
  Target, 
  RefreshCw, 
  Download, 
  Share2,
  CheckCircle,
  User,
  BookmarkPlus,
  Bookmark
} from 'lucide-react';

interface ResultsPanelProps {
  recommendations: CareerRecommendation[];
  responses: QuestionResponse[];
  onRetakeAssessment: () => void;
  detectedProfileType?: string | null;
  assessmentId?: string | null;
}

const getProfileTypeInfo = (profileType: string | null) => {
  switch (profileType) {
    case 'middle_school':
      return {
        label: 'Middle School Student',
        color: 'bg-green-100 text-green-800',
        description: 'Recommendations tailored for your academic stage',
        icon: '🎓'
      };
    case 'high_school':
      return {
        label: 'High School Student',
        color: 'bg-blue-100 text-blue-800',
        description: 'Recommendations focused on college and career preparation',
        icon: '📚'
      };
    case 'college':
      return {
        label: 'College Student',
        color: 'bg-purple-100 text-purple-800',
        description: 'Recommendations for your academic and career transition',
        icon: '🎯'
      };
    case 'career_professional':
      return {
        label: 'Career Professional',
        color: 'bg-orange-100 text-orange-800',
        description: 'Recommendations for career advancement and transitions',
        icon: '💼'
      };
    default:
      return null;
  }
};

export const ResultsPanel = ({ 
  recommendations, 
  responses, 
  onRetakeAssessment,
  detectedProfileType,
  assessmentId
}: ResultsPanelProps) => {
  const { isMobile } = useBreakpoints();
  // Use the passed assessmentId or generate a fallback UUID
  const finalAssessmentId = assessmentId || crypto.randomUUID();
  
  const {
    saveRecommendations,
    isSaving,
    isSaved,
    checkIfAlreadySaved
  } = useSaveRecommendations({
    assessmentId: finalAssessmentId,
    recommendations
  });

  useEffect(() => {
    // Only check if already saved for real assessment IDs (UUID format)
    if (finalAssessmentId && finalAssessmentId.length === 36) {
      checkIfAlreadySaved();
    }
  }, [finalAssessmentId, checkIfAlreadySaved]);

  const handleExportResults = () => {
    console.log('Exporting results...');
  };

  const handleShareResults = () => {
    console.log('Sharing results...');
  };

  const profileInfo = getProfileTypeInfo(detectedProfileType);

  return (
    <div className={`${isMobile ? 'space-y-6' : 'space-y-8'}`}>
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className={`text-center bg-gradient-to-r from-success/5 to-primary/5 ${isMobile ? 'pb-6 px-6' : 'pb-8 px-8'}`}>
          <CardTitle className={`${isMobile ? 'text-2xl' : 'text-3xl'} flex items-center justify-center gap-3 font-bold`}>
            <div className="relative">
              <Target className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-primary`} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse"></div>
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {isMobile ? 'Your Career Matches' : 'Your Personalized Career Recommendations'}
            </span>
          </CardTitle>
          
          {/* Assessment Complete Summary */}
          <div className={`bg-gradient-to-r from-success/10 to-primary/10 rounded-2xl border border-success/20 ${isMobile ? 'p-6 mt-6' : 'p-8 mt-8'}`}>
            <div className={`flex items-center justify-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <div className="relative">
                <CheckCircle className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-success mr-3`} />
                <div className="absolute inset-0 bg-success/20 rounded-full blur-md"></div>
              </div>
              <span className={`font-bold text-success ${isMobile ? 'text-lg' : 'text-xl'}`}>Assessment Complete!</span>
            </div>
            
            <div className="text-center space-y-4">
              <div className={`bg-white/80 backdrop-blur-sm rounded-xl ${isMobile ? 'p-4' : 'p-6'} inline-block shadow-lg`}>
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <Target className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-primary`} />
                  <span className="text-2xl">🎯</span>
                </div>
                <p className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'} text-foreground`}>AI-Powered Analysis Complete</p>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'} mt-1`}>
                  {responses.length} personalized questions analyzed
                </p>
              </div>
            </div>
          </div>
          
          {/* Profile Type Display */}
          {profileInfo && (
            <div className={`flex flex-col items-center ${isMobile ? 'space-y-1 mt-3' : 'space-y-2 mt-4'}`}>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-600`} />
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Assessment personalized for:</span>
              </div>
              <Badge className={profileInfo.color}>
                <span className="mr-2">{profileInfo.icon}</span>
                <User className="h-3 w-3 mr-1" />
                {profileInfo.label}
              </Badge>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground text-center`}>{profileInfo.description}</p>
            </div>
          )}
          
          <p className={`text-muted-foreground ${isMobile ? 'mt-3 text-sm' : 'mt-4'}`}>
            Based on your {responses.length} responses, here are your personalized career matches
          </p>
        </CardHeader>
        <CardContent className={`${isMobile ? 'px-6 pb-8' : 'px-8 pb-10'}`}>
          <div className={`${isMobile ? 'grid grid-cols-1 gap-3 mb-6' : 'grid grid-cols-2 gap-4 justify-center mb-8'}`}>
            <Button 
              onClick={onRetakeAssessment} 
              variant="outline"
              size="lg"
              className={`${isMobile ? 'w-full min-h-[52px] text-base' : 'min-h-[48px]'} border-2 hover:border-primary/40 transition-all duration-200`}
            >
              <RefreshCw className="h-5 w-5 mr-3" />
              Retake Assessment
            </Button>
            <Button 
              onClick={saveRecommendations} 
              variant="outline"
              size="lg"
              disabled={isSaving || isSaved || recommendations.length === 0}
              className={`${isMobile ? 'w-full min-h-[52px] text-base' : 'min-h-[48px]'} border-2 hover:border-primary/40 transition-all duration-200 disabled:opacity-50`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                  {isMobile ? 'Saving...' : 'Saving Results...'}
                </>
              ) : isSaved ? (
                <>
                  <Bookmark className="h-5 w-5 mr-3 text-success" />
                  Saved
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-5 w-5 mr-3" />
                  {isMobile ? 'Save Results' : 'Save Recommendations'}
                </>
              )}
            </Button>
            <Button 
              onClick={handleExportResults} 
              variant="outline"
              size="lg"
              className={`${isMobile ? 'w-full min-h-[52px] text-base' : 'min-h-[48px]'} border-2 hover:border-primary/40 transition-all duration-200`}
            >
              <Download className="h-5 w-5 mr-3" />
              {isMobile ? 'Export PDF' : 'Export Results'}
            </Button>
            <Button 
              onClick={handleShareResults} 
              variant="outline"
              size="lg"
              className={`${isMobile ? 'w-full min-h-[52px] text-base' : 'min-h-[48px]'} border-2 hover:border-primary/40 transition-all duration-200`}
            >
              <Share2 className="h-5 w-5 mr-3" />
              {isMobile ? 'Share Results' : 'Share Results'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AssessmentSummary responses={responses} />

      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Your Career Matches</h2>
        {recommendations.length > 0 ? (
          recommendations.map((recommendation, index) => (
            <CareerRecommendationCard
              key={recommendation.careerId}
              recommendation={recommendation}
              rank={index + 1}
            />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No recommendations generated yet. Please try retaking the assessment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
