
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
    <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      <Card>
        <CardHeader className={`text-center ${isMobile ? 'pb-4' : ''}`}>
          <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} flex items-center justify-center gap-2`}>
            <Target className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
            {isMobile ? 'Your Career Matches' : 'Your Personalized Career Recommendations'}
          </CardTitle>
          
          {/* Assessment Complete Summary */}
          <div className={`bg-green-50 rounded-lg ${isMobile ? 'p-3 mt-3' : 'p-4 mt-4'}`}>
            <div className={`flex items-center justify-center ${isMobile ? 'mb-2' : 'mb-3'}`}>
              <CheckCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-600 mr-2`} />
              <span className={`font-semibold text-green-800 ${isMobile ? 'text-sm' : ''}`}>Assessment Complete!</span>
            </div>
            
            <div className="text-center">
              <div className={`bg-white rounded-lg ${isMobile ? 'p-2' : 'p-3'} inline-block`}>
                <Target className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-green-600 mx-auto mb-1`} />
                <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Personalized Analysis</p>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>{responses.length} questions answered</p>
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
        <CardContent>
          <div className={`${isMobile ? 'grid grid-cols-1 gap-2 mb-4' : 'flex flex-wrap gap-2 justify-center mb-6'}`}>
            <Button 
              onClick={onRetakeAssessment} 
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className={isMobile ? 'w-full min-h-[44px]' : ''}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Assessment
            </Button>
            <Button 
              onClick={saveRecommendations} 
              variant="outline"
              size={isMobile ? "sm" : "default"}
              disabled={isSaving || isSaved || recommendations.length === 0}
              className={isMobile ? 'w-full min-h-[44px]' : ''}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isMobile ? 'Saving...' : 'Saving...'}
                </>
              ) : isSaved ? (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  {isMobile ? 'Save' : 'Save Recommendations'}
                </>
              )}
            </Button>
            <Button 
              onClick={handleExportResults} 
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className={isMobile ? 'w-full min-h-[44px]' : ''}
            >
              <Download className="h-4 w-4 mr-2" />
              {isMobile ? 'Export' : 'Export PDF'}
            </Button>
            <Button 
              onClick={handleShareResults} 
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className={isMobile ? 'w-full min-h-[44px]' : ''}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isMobile ? 'Share' : 'Share Results'}
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
