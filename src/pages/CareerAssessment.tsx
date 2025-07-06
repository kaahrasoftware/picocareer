
import React from 'react';
import { AssessmentIntro } from '@/components/assessment/AssessmentIntro';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import { QuestionProgress } from '@/components/assessment/QuestionProgress';
import { ResultsPanel } from '@/components/assessment/ResultsPanel';
import { useAssessmentFlow } from '@/hooks/useAssessmentFlow';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { QuestionResponse } from '@/types/assessment';

export default function CareerAssessment() {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    responses,
    detectedProfileType,
    recommendations,
    isLoading,
    isGenerating,
    showResults,
    hasStarted,
    isLastQuestion,
    assessmentId,
    handleAnswer,
    completeAssessment,
    retakeAssessment,
    startAssessment
  } = useAssessmentFlow();

  // Wrapper function to convert the old signature to the new one
  const handleQuestionAnswer = (questionId: string, answer: string | string[] | number) => {
    const response: QuestionResponse = {
      questionId,
      answer,
      timestamp: new Date().toISOString(),
    };
    handleAnswer(response);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading assessment questions...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <ResultsPanel
            recommendations={recommendations}
            responses={responses}
            onRetakeAssessment={retakeAssessment}
            detectedProfileType={detectedProfileType}
            assessmentId={assessmentId}
          />
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Career Assessment</h1>
            <p className="text-muted-foreground text-lg">
              Discover your ideal career path through our personalized 8-question assessment
            </p>
          </div>
          <AssessmentIntro onStart={startAssessment} />
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No questions available.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Career Assessment</h1>
          <p className="text-muted-foreground">
            Answer {totalQuestions} questions to discover your perfect career match
          </p>
        </div>

        <QuestionProgress
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          currentQuestion={currentQuestion}
          detectedProfileType={detectedProfileType}
          profileDetectionCompleted={!!detectedProfileType}
        />

        <QuestionRenderer
          question={currentQuestion}
          onAnswer={handleQuestionAnswer}
          onComplete={completeAssessment}
          isGenerating={isGenerating}
          isLastQuestion={isLastQuestion}
          detectedProfileType={detectedProfileType}
        />
      </div>
    </div>
  );
}
