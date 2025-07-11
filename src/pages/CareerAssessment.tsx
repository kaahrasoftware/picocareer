
import React from 'react';
import { AssessmentIntro } from '@/components/assessment/AssessmentIntro';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import { QuestionProgress } from '@/components/assessment/QuestionProgress';
import { ResultsPanel } from '@/components/assessment/ResultsPanel';
import { useAssessmentFlow } from '@/hooks/useAssessmentFlow';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { QuestionResponse } from '@/types/assessment';

export default function CareerAssessment() {
  const { isMobile } = useBreakpoints();
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

  // Wrapper function that matches the QuestionRenderer's expected signature
  const handleQuestionAnswer = (response: QuestionResponse) => {
    handleAnswer(response);
  };

  if (isLoading) {
    return (
      <div className={`container ${isMobile ? 'py-4 px-4' : 'py-8'}`}>
        <div className={`${isMobile ? 'max-w-full' : 'max-w-3xl'} mx-auto`}>
          <Card>
            <CardContent className={`flex items-center justify-center ${isMobile ? 'py-8' : 'py-12'}`}>
              <div className="text-center space-y-4">
                <Loader2 className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} animate-spin mx-auto text-primary`} />
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Loading assessment questions...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className={`container ${isMobile ? 'py-4 px-4' : 'py-8'}`}>
        <div className={`${isMobile ? 'max-w-full' : 'max-w-4xl'} mx-auto`}>
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
      <div className={`container ${isMobile ? 'py-4 px-4' : 'py-8'}`}>
        <div className={`${isMobile ? 'max-w-full' : 'max-w-3xl'} mx-auto ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          <div className={`text-center ${isMobile ? 'space-y-2' : 'space-y-4'}`}>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>Career Assessment</h1>
            <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
              Discover your ideal career path through our personalized assessment
            </p>
          </div>
          <AssessmentIntro onStart={startAssessment} />
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={`container ${isMobile ? 'py-4 px-4' : 'py-8'}`}>
        <div className={`${isMobile ? 'max-w-full' : 'max-w-3xl'} mx-auto`}>
          <Card>
            <CardContent className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
              <p className="text-muted-foreground">No questions available.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${isMobile ? 'py-4 px-4' : 'py-8'}`}>
      <div className={`${isMobile ? 'max-w-full' : 'max-w-3xl'} mx-auto ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
        <div className="text-center">
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>Career Assessment</h1>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            Answer personalized questions to discover your perfect career match
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
