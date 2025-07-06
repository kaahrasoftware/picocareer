
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CareerRecommendationCard } from './CareerRecommendationCard';
import { AssessmentSummary } from './AssessmentSummary';
import { CareerRecommendation, QuestionResponse } from '@/types/assessment';
import { useSaveRecommendations } from '@/hooks/useSaveRecommendations';
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
  detectedProfileType
}: ResultsPanelProps) => {
  // Create a mock assessment ID from responses - in real app this would come from actual assessment
  const assessmentId = `assessment_${responses.length}_${Date.now()}`;
  
  const {
    saveRecommendations,
    isSaving,
    isSaved,
    checkIfAlreadySaved
  } = useSaveRecommendations({
    assessmentId,
    recommendations
  });

  useEffect(() => {
    // Check if recommendations are already saved when component mounts
    checkIfAlreadySaved();
  }, [checkIfAlreadySaved]);

  const handleExportResults = () => {
    console.log('Exporting results...');
  };

  const handleShareResults = () => {
    console.log('Sharing results...');
  };

  const profileInfo = getProfileTypeInfo(detectedProfileType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Your Personalized Career Recommendations
          </CardTitle>
          
          {/* Assessment Complete Summary */}
          <div className="bg-green-50 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-center mb-3">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Assessment Complete!</span>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-lg p-3 inline-block">
                <Target className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="font-medium">Personalized Analysis</p>
                <p className="text-muted-foreground">{responses.length} questions answered</p>
              </div>
            </div>
          </div>
          
          {/* Profile Type Display */}
          {profileInfo && (
            <div className="flex flex-col items-center space-y-2 mt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Assessment personalized for:</span>
              </div>
              <Badge className={profileInfo.color}>
                <span className="mr-2">{profileInfo.icon}</span>
                <User className="h-3 w-3 mr-1" />
                {profileInfo.label}
              </Badge>
              <p className="text-sm text-muted-foreground">{profileInfo.description}</p>
            </div>
          )}
          
          <p className="text-muted-foreground mt-4">
            Based on your {responses.length} responses, here are your personalized career matches
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <Button onClick={onRetakeAssessment} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Assessment
            </Button>
            <Button 
              onClick={saveRecommendations} 
              variant="outline"
              disabled={isSaving || isSaved || recommendations.length === 0}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save Recommendations
                </>
              )}
            </Button>
            <Button onClick={handleExportResults} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={handleShareResults} variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
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
