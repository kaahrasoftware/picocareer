
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssessmentIntro } from '@/components/assessment/AssessmentIntro';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import { ResultsPanel } from '@/components/assessment/ResultsPanel';
import { AssessmentHistory } from '@/components/assessment/AssessmentHistory';
import { ProfileDetectionResult } from '@/components/assessment/ProfileDetectionResult';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAssessmentFlow } from '@/hooks/useAssessmentFlow';
import { useAssessmentResults } from '@/hooks/useAssessmentResults';
import { Brain, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

type AssessmentPhase = 'intro' | 'assessment' | 'results' | 'history' | 'view-results';

export default function CareerAssessment() {
  const { session } = useAuthSession();
  const [currentPhase, setCurrentPhase] = useState<AssessmentPhase>('intro');
  const [viewingAssessmentId, setViewingAssessmentId] = useState<string | null>(null);
  
  const {
    currentStep,
    currentQuestion,
    responses,
    recommendations,
    detectedProfileType,
    showProfileResult,
    isGenerating,
    stepProgress,
    isLastQuestionInStep,
    isAssessmentReady,
    isCreatingAssessment,
    totalQuestionsInStep,
    currentQuestionIndex,
    handleAnswer,
    proceedToProfileSpecific,
    proceedToAiGeneration,
    resetAssessment
  } = useAssessmentFlow();

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
    setCurrentPhase('assessment');
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
    const answer = typeof response === 'object' && response.answer ? response.answer : response;
    console.log('Answer wrapper received:', response, 'Converted to:', answer);
    handleAnswer(answer);
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 'profile_detection':
        return { current: 1, total: 3, label: 'Profile Detection' };
      case 'profile_specific':
        return { current: 2, total: 3, label: 'Personalized Questions' };
      case 'ai_generation':
        return { current: 3, total: 3, label: 'AI Analysis' };
      case 'results':
        return { current: 3, total: 3, label: 'Results' };
      default:
        return { current: 1, total: 3, label: 'Assessment' };
    }
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
        
        {/* Step Progress Display */}
        {currentPhase === 'assessment' && (
          <div className="mt-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {getStepInfo().current}
                  </div>
                  <div>
                    <p className="font-semibold">Step {getStepInfo().current} of {getStepInfo().total}</p>
                    <p className="text-sm text-muted-foreground">{getStepInfo().label}</p>
                  </div>
                </div>
                
                {detectedProfileType && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Profile: {detectedProfileType.replace('_', ' ')}</span>
                  </div>
                )}
              </div>
              
              {currentQuestion && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Question {currentQuestionIndex + 1} of {totalQuestionsInStep}</span>
                    <span>{Math.round(stepProgress)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stepProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
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
                  <span>Preparing your personalized assessment...</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {currentPhase === 'assessment' && (
        <div>
          {/* Profile Detection Result Screen */}
          {showProfileResult && detectedProfileType && (
            <ProfileDetectionResult
              profileType={detectedProfileType}
              onContinue={proceedToProfileSpecific}
            />
          )}

          {/* AI Generation Loading Screen */}
          {currentStep === 'ai_generation' && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <Brain className="h-12 w-12 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Your Responses</h3>
                    <p className="text-muted-foreground mb-4">
                      Our AI is processing your answers to generate personalized career recommendations...
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">This may take a few moments</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Question */}
          {currentQuestion && !showProfileResult && currentStep !== 'ai_generation' && (
            <QuestionRenderer
              question={currentQuestion}
              onAnswer={handleAnswerWrapper}
              onComplete={proceedToAiGeneration}
              isGenerating={isGenerating}
              isLastQuestion={isLastQuestionInStep}
              detectedProfileType={detectedProfileType}
            />
          )}

          {/* Results */}
          {currentStep === 'results' && (
            <ResultsPanel 
              recommendations={recommendations}
              responses={responses}
              onRetakeAssessment={handleBackToIntro}
              detectedProfileType={detectedProfileType}
            />
          )}
        </div>
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
              detectedProfileType={detectedProfileType}
            />
          )}
        </div>
      )}
    </div>
  );
}
