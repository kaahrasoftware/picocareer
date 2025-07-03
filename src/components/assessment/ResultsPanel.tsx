
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
  Users
} from 'lucide-react';

interface ResultsPanelProps {
  recommendations: CareerRecommendation[];
  responses: QuestionResponse[];
  onRetakeAssessment: () => void;
}

export const ResultsPanel = ({ 
  recommendations, 
  responses, 
  onRetakeAssessment 
}: ResultsPanelProps) => {
  const handleExportResults = () => {
    // Implementation for exporting results as PDF
    console.log('Exporting results...');
  };

  const handleShareResults = () => {
    // Implementation for sharing results
    console.log('Sharing results...');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Your Career Recommendations
          </CardTitle>
          <p className="text-muted-foreground">
            Based on your responses, here are careers that match your profile
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
        <h2 className="text-xl font-semibold">Recommended Careers</h2>
        {recommendations.map((recommendation, index) => (
          <CareerRecommendationCard
            key={recommendation.careerId}
            recommendation={recommendation}
            rank={index + 1}
          />
        ))}
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
