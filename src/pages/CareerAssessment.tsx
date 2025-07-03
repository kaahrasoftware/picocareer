
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AssessmentIntro } from '@/components/assessment/AssessmentIntro';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import { ResultsPanel } from '@/components/assessment/ResultsPanel';
import { AssessmentHistory } from '@/components/assessment/AssessmentHistory';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAssessmentFlow } from '@/hooks/useAssessmentFlow';
import { Brain, ArrowLeft } from 'lucide-react';

type AssessmentPhase = 'intro' | 'questions' | 'results' | 'history';

export default function CareerAssessment() {
  const { session } = useAuthSession();
  const [currentPhase, setCurrentPhase] = useState<AssessmentPhase>('intro');
  const {
    currentQuestion,
    responses,
    recommendations,
    isGenerating,
    progress,
    handleAnswer,
    generateRecommendations,
    resetAssessment
  } = useAssessmentFlow();

  const handleStartAssessment = () => {
    setCurrentPhase('questions');
  };

  const handleCompleteAssessment = async () => {
    await generateRecommendations();
    setCurrentPhase('results');
  };

  const handleBackToIntro = () => {
    resetAssessment();
    setCurrentPhase('intro');
  };

  const handleViewHistory = () => {
    setCurrentPhase('history');
  };

  const handleAnswerWrapper = (response: any) => {
    // Convert the response to the expected format
    const answer = typeof response === 'object' && response.answer ? response.answer : response;
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
          {currentPhase !== 'intro' && (
            <Button variant="outline" onClick={handleBackToIntro}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>
        
        {currentPhase === 'questions' && (
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(progress)}% Complete
            </p>
          </div>
        )}
      </div>

      {currentPhase === 'intro' && (
        <AssessmentIntro 
          onStart={handleStartAssessment}
          onViewHistory={handleViewHistory}
        />
      )}

      {currentPhase === 'questions' && currentQuestion && (
        <QuestionRenderer
          question={currentQuestion}
          onAnswer={handleAnswerWrapper}
          onComplete={handleCompleteAssessment}
          isGenerating={isGenerating}
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
        />
      )}
    </div>
  );
}
