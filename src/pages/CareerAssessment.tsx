
import React from 'react';
import { useAssessmentFlow } from '@/hooks/useAssessmentFlow';
import { AssessmentIntro } from '@/components/assessment/AssessmentIntro';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import { QuestionProgress } from '@/components/assessment/QuestionProgress';
import { ResultsPanel } from '@/components/assessment/ResultsPanel';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CareerAssessment = () => {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    responses,
    selectedProfileType,
    isComplete,
    isGenerating,
    isLastQuestion,
    recommendations,
    isLoading,
    recommendationsLoading,
    handleQuestionResponse,
    completeAssessment,
    resetAssessment,
  } = useAssessmentFlow();

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Card className="p-6">
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-24 w-full mb-6" />
            <Skeleton className="h-10 w-32 ml-auto" />
          </Card>
        </div>
      </div>
    );
  }

  // Show results after completion
  if (isComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ResultsPanel
            recommendations={recommendations}
            responses={responses}
            onRetakeAssessment={resetAssessment}
            detectedProfileType={selectedProfileType}
          />
        </div>
      </div>
    );
  }

  // Show intro before starting
  if (currentQuestionIndex === 0 && responses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AssessmentIntro 
            onStart={() => {}} 
            onViewHistory={() => console.log('View history clicked')}
          />
        </div>
      </div>
    );
  }

  // Show question flow
  if (currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <QuestionProgress
            currentIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            currentQuestion={currentQuestion}
            detectedProfileType={selectedProfileType}
            profileDetectionCompleted={!!selectedProfileType}
          />
          
          <QuestionRenderer
            question={currentQuestion}
            onAnswer={handleQuestionResponse}
            onComplete={completeAssessment}
            isGenerating={isGenerating}
            isLastQuestion={isLastQuestion}
            detectedProfileType={selectedProfileType}
          />
        </div>
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 text-center">
          <p>Loading assessment...</p>
        </Card>
      </div>
    </div>
  );
};

export default CareerAssessment;
