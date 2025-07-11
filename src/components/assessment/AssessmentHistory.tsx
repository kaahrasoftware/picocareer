
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
  onViewResults: (assessmentId: string) => void;
}

export const AssessmentHistory = ({ 
  onBackToIntro, 
  onRetakeAssessment,
  onViewResults 
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
        <CardContent className="flex items-center justify-center py-6 sm:py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm sm:text-base">Loading assessment history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
            Assessment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error}
            </AlertDescription>
          </Alert>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onBackToIntro} className="w-full sm:w-auto">
              Back to Home
            </Button>
            <Button onClick={refetch} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-gradient-to-br from-card via-card to-accent/5 border border-border/50">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Assessment History
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={onBackToIntro} className="w-full sm:w-auto">
                Back to Home
              </Button>
              <Button onClick={onRetakeAssessment} className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Take New Assessment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <History className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No Completed Assessments</h3>
              <p className="text-muted-foreground text-sm sm:text-base mb-4 px-4">
                You haven't completed any career assessments yet. Take your first assessment to get personalized recommendations.
              </p>
              <Button onClick={onRetakeAssessment} className="w-full sm:w-auto">
                Start Your First Assessment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 text-center sm:text-left">
                You have completed {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}
              </p>
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-all duration-200 border border-border/30 hover:border-primary/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                              {new Date(assessment.completedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                              <span className="hidden sm:inline ml-1">
                                • {new Date(assessment.completedAt).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </span>
                            </span>
                          </div>
                          <Badge 
                            variant={assessment.status === 'completed' ? 'default' : 'secondary'}
                            className="w-fit text-xs"
                          >
                            {assessment.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium text-sm sm:text-base">
                            {assessment.recommendationCount} Career Recommendation{assessment.recommendationCount !== 1 ? 's' : ''}
                          </p>
                          {assessment.topRecommendation && (
                            <div className="bg-primary/5 rounded-md p-2 sm:p-3 border border-primary/10">
                              <p className="text-xs sm:text-sm text-foreground/80">
                                🎯 <span className="font-medium">Top Match:</span> 
                                <span className="text-primary font-semibold ml-1">
                                  {assessment.topRecommendation}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewResults(assessment.id)}
                        className="w-full sm:w-auto shrink-0 h-8 sm:h-9"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="text-xs sm:text-sm">View Results</span>
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
