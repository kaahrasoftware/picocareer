
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAssessmentHistory } from '@/hooks/useAssessmentHistory';
import { History, Calendar, Eye, RefreshCw, AlertCircle } from 'lucide-react';

interface AssessmentHistoryProps {
  onBackToIntro: () => void;
  onRetakeAssessment: () => void;
}

export const AssessmentHistory = ({ 
  onBackToIntro, 
  onRetakeAssessment 
}: AssessmentHistoryProps) => {
  const { assessments, isLoading, error, refetch } = useAssessmentHistory();

  console.log('AssessmentHistory render:', { 
    assessmentsCount: assessments.length, 
    isLoading, 
    error 
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading assessment history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Assessment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBackToIntro}>
              Back to Home
            </Button>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Assessment History
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBackToIntro}>
                Back to Home
              </Button>
              <Button onClick={onRetakeAssessment}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Take New Assessment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Completed Assessments</h3>
              <p className="text-muted-foreground mb-4">
                You haven't completed any career assessments yet. Take your first assessment to get personalized recommendations.
              </p>
              <Button onClick={onRetakeAssessment}>
                Start Your First Assessment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                You have completed {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}
              </p>
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(assessment.completedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'}>
                            {assessment.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">
                            {assessment.recommendationCount} Career Recommendation{assessment.recommendationCount !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Top Match: {assessment.topRecommendation}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                        <span className="ml-1 text-xs text-muted-foreground">(Coming Soon)</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
