
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AssessmentIntro } from '@/components/assessment/AssessmentIntro';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import { ResultsPanel } from '@/components/assessment/ResultsPanel';
import { AssessmentHistory } from '@/components/assessment/AssessmentHistory';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAssessmentFlow } from '@/hooks/useAssessmentFlow';
import { useAssessmentResults } from '@/hooks/useAssessmentResults';
import { Brain, ArrowLeft, Loader2, User } from 'lucide-react';

type AssessmentPhase = 'intro' | 'questions' | 'results' | 'history' | 'view-results';

const getProfileTypeLabel = (profileType: string | null) => {
  switch (profileType) {
    case 'middle_school':
      return 'Middle School Student';
    case 'high_school':
      return 'High School Student';
    case 'college':
      return 'College Student';
    case 'career_professional':
      return 'Career Professional';
    default:
      return 'Getting to know you...';
  }
};

const getProfileTypeColor = (profileType: string | null) => {
  switch (profileType) {
    case 'middle_school':
      return 'bg-green-100 text-green-800';
    case 'high_school':
      return 'bg-blue-100 text-blue-800';
    case 'college':
      return 'bg-purple-100 text-purple-800';
    case 'career_professional':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function CareerAssessment() {
  const { session } = useAuthSession();
  const [currentPhase, setCurrentPhase] = useState<AssessmentPhase>('intro');
  const [viewingAssessmentId, setViewingAssessmentId] = useState<string | null>(null);
  
  const {
    currentQuestion,
    responses,
    recommendations,
    detectedProfileType,
    profileDetectionCompleted,
    isGenerating,
    progress,
    isLastQuestion,
    isAssessmentReady,
    isCreatingAssessment,
    handleAnswer,
    generateRecommendations,
    resetAssessment
  } = useAssessmentFlow();

  // Hook for viewing historical results
  const { 
    recommendations: historicalRecommendations, 
    responses: historicalResponses, 
    isLoading: isLoadingHistorical, 
    error: historicalError 
  } = useAssessmentResults(viewingAssessmentId);

  const handleStartAssessment = () => {
    if (!isAssessmentReady && !isCreatingAssessment) {
      console.log('Assessment not ready yet, please wait...');
      return;
    }
    console.log('Starting assessment phase');
    setCurrentPhase('questions');
  };

  const handleCompleteAssessment = async () => {
    console.log('Completing assessment with', responses.length, 'responses');
    
    if (responses.length === 0) {
      console.error('No responses to process');
      return;
    }
    
    try {
      await generateRecommendations();
      setCurrentPhase('results');
    } catch (error) {
      console.error('Failed to complete assessment:', error);
      // Error is already handled in the hook
    }
  };

  const handleBackToIntro = () => {
    console.log('Returning to intro and resetting assessment');
    resetAssessment();
    setCurrentPhase('intro');
    setViewingAssessmentId(null);
  };

  const handleViewHistory = () => {
    setCurrentPhase('history');
  };

  const handleViewResults = (assessmentId: string) => {
    console.log('Viewing results for assessment:', assessmentId);
    setViewingAssessmentId(assessmentId);
    setCurrentPhase('view-results');
  };

  const handleBackToHistory = () => {
    setViewingAssessmentId(null);
    setCurrentPhase('history');
  };

  const handleAnswerWrapper = (response: any) => {
    // Convert the response to the expected format
    const answer = typeof response === 'object' && response.answer ? response.answer : response;
    console.log('Answer wrapper received:', response, 'Converted to:', answer);
    handleAnswer(answer);
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              AI Career Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Please sign in to take the career assessment and get personalized recommendations.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Career Assessment
          </h1>
          {(currentPhase !== 'intro' && currentPhase !== 'view-results') && (
            <Button variant="outline" onClick={handleBackToIntro}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          )}
          {currentPhase === 'view-results' && (
            <Button variant="outline" onClick={handleBackToHistory}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          )}
        </div>
        
        {currentPhase === 'questions' && (
          <div className="mt-4 space-y-3">
            {/* Profile Type Badge */}
            {detectedProfileType && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Badge className={getProfileTypeColor(detectedProfileType)}>
                  {getProfileTypeLabel(detectedProfileType)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Questions tailored for your stage
                </span>
              </div>
            )}
            
            {/* Progress Bar */}
            <div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(progress)}% Complete
              </p>
            </div>
          </div>
        )}

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <p>Debug: Assessment Ready: {isAssessmentReady ? 'Yes' : 'No'}</p>
            <p>Creating Assessment: {isCreatingAssessment ? 'Yes' : 'No'}</p>
            <p>Responses Count: {responses.length}</p>
            <p>Profile Type: {detectedProfileType || 'Not detected'}</p>
            <p>Profile Detection Complete: {profileDetectionCompleted ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>

      {currentPhase === 'intro' && (
        <div>
          <AssessmentIntro 
            onStart={handleStartAssessment}
            onViewHistory={handleViewHistory}
          />
          {isCreatingAssessment && (
            <Card className="mt-4">
              <CardContent className="py-6">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Preparing your assessment...</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {currentPhase === 'questions' && currentQuestion && (
        <QuestionRenderer
          question={currentQuestion}
          onAnswer={handleAnswerWrapper}
          onComplete={handleCompleteAssessment}
          isGenerating={isGenerating}
          isLastQuestion={isLastQuestion}
        />
      )}

      {currentPhase === 'results' && (
        <ResultsPanel 
          recommendations={recommendations}
          responses={responses}
          onRetakeAssessment={handleBackToIntro}
        />
      )}

      {currentPhase === 'history' && (
        <AssessmentHistory 
          onBackToIntro={handleBackToIntro}
          onRetakeAssessment={handleStartAssessment}
          onViewResults={handleViewResults}
        />
      )}

      {currentPhase === 'view-results' && (
        <div>
          {isLoadingHistorical ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p>Loading assessment results...</p>
                </div>
              </CardContent>
            </Card>
          ) : historicalError ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-destructive mb-4">Error loading results: {historicalError}</p>
                <Button variant="outline" onClick={handleBackToHistory}>
                  Back to History
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ResultsPanel 
              recommendations={historicalRecommendations}
              responses={historicalResponses}
              onRetakeAssessment={handleBackToIntro}
            />
          )}
        </div>
      )}
    </div>
  );
}
