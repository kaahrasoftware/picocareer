
import React, { useMemo } from 'react';
import { AssessmentIntro } from '@/components/assessment/AssessmentIntro';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import { AssessmentProgressIndicator } from '@/components/assessment/AssessmentProgressIndicator';
import { PathwaySelectionCard } from '@/components/assessment/PathwaySelectionCard';
import { SubjectClusterGrid } from '@/components/assessment/SubjectClusterGrid';
import { ResultsPanel } from '@/components/assessment/ResultsPanel';
import { useAssessmentFlow } from '@/hooks/useAssessmentFlow';
import { useAllSubjectClusters } from '@/hooks/useCareerPathways';
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
    startAssessment,
    selectedPathwayIds,
    selectedClusterIds,
    pathways
  } = useAssessmentFlow();

  const { data: allClusters } = useAllSubjectClusters();

  // Calculate current tier and progress
  const { currentTier, progressPercentage } = useMemo(() => {
    if (!currentQuestion?.pathway_tier) {
      return { currentTier: 'profile_detection' as const, progressPercentage: 10 };
    }

    const tier = currentQuestion.pathway_tier;
    let progress = 0;

    switch (tier) {
      case 'profile_detection':
        progress = Math.min(20, (currentQuestionIndex / Math.max(totalQuestions, 1)) * 20);
        break;
      case 'career_choice':
        progress = 20 + ((selectedPathwayIds.length / 3) * 20);
        break;
      case 'subject_cluster':
        progress = 40 + ((selectedClusterIds.length / 5) * 20);
        break;
      case 'refinement':
        progress = 60 + ((currentQuestionIndex / Math.max(totalQuestions, 1)) * 20);
        break;
      case 'practical':
        progress = 80 + ((currentQuestionIndex / Math.max(totalQuestions, 1)) * 20);
        break;
      default:
        progress = (currentQuestionIndex / Math.max(totalQuestions, 1)) * 100;
    }

    return { currentTier: tier, progressPercentage: Math.min(100, progress) };
  }, [currentQuestion, currentQuestionIndex, totalQuestions, selectedPathwayIds.length, selectedClusterIds.length]);

  // Handler for pathway selection
  const handlePathwaySelect = (pathwayId: string) => {
    if (!currentQuestion) return;

    const pathway = pathways.find(p => p.id === pathwayId);
    if (!pathway) return;

    let updatedSelection: string[];
    if (selectedPathwayIds.includes(pathwayId)) {
      updatedSelection = selectedPathwayIds.filter(id => id !== pathwayId);
    } else if (selectedPathwayIds.length < 3) {
      updatedSelection = [...selectedPathwayIds, pathwayId];
    } else {
      return; // Max 3 pathways
    }

    // Map IDs back to titles for the response
    const selectedTitles = pathways
      .filter(p => updatedSelection.includes(p.id))
      .map(p => p.title);

    handleAnswer({
      questionId: currentQuestion.id,
      answer: selectedTitles,
      timestamp: new Date().toISOString()
    });
  };

  // Handler for cluster selection
  const handleClusterSelect = (clusterId: string) => {
    if (!currentQuestion || !allClusters) return;

    const cluster = allClusters.find(c => c.id === clusterId);
    if (!cluster) return;

    let updatedSelection: string[];
    if (selectedClusterIds.includes(clusterId)) {
      updatedSelection = selectedClusterIds.filter(id => id !== clusterId);
    } else if (selectedClusterIds.length < 5) {
      updatedSelection = [...selectedClusterIds, clusterId];
    } else {
      return; // Max 5 clusters
    }

    handleAnswer({
      questionId: currentQuestion.id,
      answer: updatedSelection,
      timestamp: new Date().toISOString()
    });
  };

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

  // Render pathway selection view
  if (currentQuestion?.pathway_tier === 'career_choice') {
    return (
      <div className={`min-h-screen ${isMobile ? 'px-4 py-6' : 'py-8'} bg-gradient-to-br from-background to-secondary/10`}>
        <div className={`sticky top-0 z-10 ${isMobile ? 'mb-6' : 'mb-8'} bg-background/80 backdrop-blur-sm border-b`}>
          <div className={`${isMobile ? 'max-w-full py-4' : 'max-w-4xl py-6'} mx-auto`}>
            <AssessmentProgressIndicator
              currentTier={currentTier}
              progress={progressPercentage}
              selectedPathwaysCount={selectedPathwayIds.length}
              selectedClustersCount={selectedClusterIds.length}
              detectedProfileType={detectedProfileType}
              isMobile={isMobile}
            />
          </div>
        </div>

        <div className={`${isMobile ? 'max-w-full' : 'max-w-5xl'} mx-auto ${isMobile ? 'space-y-6' : 'space-y-8'}`}>
          <div className="text-center space-y-3">
            <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
              {currentQuestion.title}
            </h2>
            {currentQuestion.description && (
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'} max-w-2xl mx-auto`}>
                {currentQuestion.description}
              </p>
            )}
            <p className="text-sm text-primary font-medium">
              Select 1-3 career pathways that interest you most
            </p>
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
            {pathways.map((pathway) => (
              <PathwaySelectionCard
                key={pathway.id}
                pathway={pathway}
                isSelected={selectedPathwayIds.includes(pathway.id)}
                onSelect={handlePathwaySelect}
                maxSelections={3}
                currentSelectionCount={selectedPathwayIds.length}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render subject cluster selection view
  if (currentQuestion?.pathway_tier === 'subject_cluster' && allClusters) {
    const relevantClusters = allClusters.filter(cluster => 
      selectedPathwayIds.includes(cluster.pathway_id)
    );

    return (
      <div className={`min-h-screen ${isMobile ? 'px-4 py-6' : 'py-8'} bg-gradient-to-br from-background to-secondary/10`}>
        <div className={`sticky top-0 z-10 ${isMobile ? 'mb-6' : 'mb-8'} bg-background/80 backdrop-blur-sm border-b`}>
          <div className={`${isMobile ? 'max-w-full py-4' : 'max-w-4xl py-6'} mx-auto`}>
            <AssessmentProgressIndicator
              currentTier={currentTier}
              progress={progressPercentage}
              selectedPathwaysCount={selectedPathwayIds.length}
              selectedClustersCount={selectedClusterIds.length}
              detectedProfileType={detectedProfileType}
              isMobile={isMobile}
            />
          </div>
        </div>

        <div className={`${isMobile ? 'max-w-full' : 'max-w-5xl'} mx-auto ${isMobile ? 'space-y-6' : 'space-y-8'}`}>
          <div className="text-center space-y-3">
            <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
              {currentQuestion.title}
            </h2>
            {currentQuestion.description && (
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'} max-w-2xl mx-auto`}>
                {currentQuestion.description}
              </p>
            )}
            <p className="text-sm text-primary font-medium">
              Select up to 5 subject areas that match your interests
            </p>
          </div>

          <SubjectClusterGrid
            clusters={relevantClusters}
            selectedClusterIds={selectedClusterIds}
            onSelectCluster={handleClusterSelect}
            maxSelections={5}
          />
        </div>
      </div>
    );
  }

  // Regular question renderer for other tiers
  return (
    <div className={`min-h-screen ${isMobile ? 'px-4 py-6' : 'py-8'} bg-gradient-to-br from-background to-secondary/10`}>
      <div className={`sticky top-0 z-10 ${isMobile ? 'mb-6' : 'mb-8'} bg-background/80 backdrop-blur-sm border-b`}>
        <div className={`${isMobile ? 'max-w-full py-4' : 'max-w-3xl py-6'} mx-auto`}>
          <AssessmentProgressIndicator
            currentTier={currentTier}
            progress={progressPercentage}
            selectedPathwaysCount={selectedPathwayIds.length}
            selectedClustersCount={selectedClusterIds.length}
            detectedProfileType={detectedProfileType}
            isMobile={isMobile}
          />
        </div>
      </div>

      <div className={`${isMobile ? 'max-w-full' : 'max-w-3xl'} mx-auto ${isMobile ? 'space-y-6' : 'space-y-8'}`}>
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
