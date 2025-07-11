
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
      <div className={`min-h-screen ${isMobile ? 'px-4 py-6' : 'py-8'} bg-gradient-to-br from-background to-secondary/10`}>
        <div className={`${isMobile ? 'max-w-full' : 'max-w-3xl'} mx-auto`}>
          <Card className="shadow-lg border-0">
            <CardContent className={`flex items-center justify-center ${isMobile ? 'py-12' : 'py-16'}`}>
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                  <Loader2 className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} animate-spin mx-auto text-primary relative z-10`} />
                </div>
                <div className="space-y-2">
                  <p className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>Preparing Your Assessment</p>
                  <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                    Creating personalized questions just for you...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className={`min-h-screen ${isMobile ? 'px-4 py-6' : 'py-8'} bg-gradient-to-br from-background to-secondary/10`}>
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
      <div className={`min-h-screen ${isMobile ? 'px-4 py-6' : 'py-8'} bg-gradient-to-br from-background to-secondary/10`}>
        <div className={`${isMobile ? 'max-w-full' : 'max-w-3xl'} mx-auto ${isMobile ? 'space-y-6' : 'space-y-8'}`}>
          <div className={`text-center ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            <div className="space-y-2">
              <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent`}>
                Career Assessment
              </h1>
              <p className={`text-muted-foreground ${isMobile ? 'text-lg' : 'text-xl'} max-w-2xl mx-auto leading-relaxed`}>
                Discover your ideal career path through our AI-powered personalized assessment
              </p>
            </div>
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
    <div className={`min-h-screen ${isMobile ? 'px-4 py-6' : 'py-8'} bg-gradient-to-br from-background to-secondary/10`}>
      {/* Sticky Header */}
      <div className={`sticky top-0 z-10 ${isMobile ? 'mb-6' : 'mb-8'} bg-background/80 backdrop-blur-sm border-b`}>
        <div className={`${isMobile ? 'max-w-full py-4' : 'max-w-3xl py-6'} mx-auto`}>
          <div className="text-center space-y-2">
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent`}>
              Career Assessment
            </h1>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
        </div>
      </div>

      <div className={`${isMobile ? 'max-w-full' : 'max-w-3xl'} mx-auto ${isMobile ? 'space-y-6' : 'space-y-8'}`}>
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
