
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ResultsPanel } from '@/components/assessment/ResultsPanel';
import { useAssessmentResults } from '@/hooks/useAssessmentResults';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function AssessmentResults() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { recommendations, responses, isLoading, error } = useAssessmentResults(assessmentId || null);

  const handleBackToHistory = () => {
    navigate('/career-assessment/history');
  };

  const handleRetakeAssessment = () => {
    navigate('/career-assessment');
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading assessment results...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12 space-y-4">
              <p className="text-destructive font-medium">Error loading assessment results</p>
              <p className="text-muted-foreground">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleBackToHistory} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to History
                </Button>
                <Button onClick={handleRetakeAssessment}>
                  Take New Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!recommendations.length && !responses.length) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12 space-y-4">
              <p className="text-muted-foreground">No assessment results found</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleBackToHistory} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to History
                </Button>
                <Button onClick={handleRetakeAssessment}>
                  Take New Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToHistory} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Assessment Results</h1>
            <p className="text-muted-foreground">
              Viewing results from a previous assessment
            </p>
          </div>
        </div>

        <ResultsPanel
          recommendations={recommendations}
          responses={responses}
          onRetakeAssessment={handleRetakeAssessment}
          assessmentId={assessmentId}
        />
      </div>
    </div>
  );
}
