
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAssessmentHistory } from '@/hooks/useAssessmentHistory';
import { History, Calendar, Eye, RefreshCw } from 'lucide-react';

interface AssessmentHistoryProps {
  onBackToIntro: () => void;
  onRetakeAssessment: () => void;
}

export const AssessmentHistory = ({ 
  onBackToIntro, 
  onRetakeAssessment 
}: AssessmentHistoryProps) => {
  const { assessments, isLoading } = useAssessmentHistory();

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
              <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
              <p className="text-muted-foreground mb-4">
                Take your first career assessment to get personalized recommendations.
              </p>
              <Button onClick={onRetakeAssessment}>
                Start Your First Assessment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(assessment.completedAt).toLocaleDateString()}
                          </span>
                          <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'}>
                            {assessment.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">
                            {assessment.recommendationCount} Career Recommendations
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Top Match: {assessment.topRecommendation}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
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
