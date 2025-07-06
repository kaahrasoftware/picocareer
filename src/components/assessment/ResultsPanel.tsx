
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CareerRecommendationCard } from './CareerRecommendationCard';
import { AssessmentSummary } from './AssessmentSummary';
import { CareerRecommendation, QuestionResponse } from '@/types/assessment';
import { 
  Target, 
  RefreshCw, 
  Download, 
  Share2,
  BookOpen,
  Users,
  User,
  CheckCircle
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
        description: 'Recommendations tailored for your academic stage'
      };
    case 'high_school':
      return {
        label: 'High School Student',
        color: 'bg-blue-100 text-blue-800',
        description: 'Recommendations focused on college and career preparation'
      };
    case 'college':
      return {
        label: 'College Student',
        color: 'bg-purple-100 text-purple-800',
        description: 'Recommendations for your academic and career transition'
      };
    case 'career_professional':
      return {
        label: 'Career Professional',
        color: 'bg-orange-100 text-orange-800',
        description: 'Recommendations for career advancement and transitions'
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
  const handleExportResults = () => {
    // Implementation for exporting results as PDF
    console.log('Exporting results...');
  };

  const handleShareResults = () => {
    // Implementation for sharing results
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
          
          {/* Profile Type Display */}
          {profileInfo && (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Assessment personalized for:</span>
              </div>
              <Badge className={profileInfo.color}>
                <User className="h-3 w-3 mr-1" />
                {profileInfo.label}
              </Badge>
              <p className="text-sm text-muted-foreground">{profileInfo.description}</p>
            </div>
          )}
          
          <p className="text-muted-foreground">
            Based on your {responses.length} responses, here are your personalized career matches
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <Button onClick={onRetakeAssessment} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Assessment
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

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Explore Programs</div>
                  <div className="text-sm text-muted-foreground">
                    Find relevant academic programs
                  </div>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Connect with Mentors</div>
                  <div className="text-sm text-muted-foreground">
                    Get guidance from professionals
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
