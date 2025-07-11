
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentHistory } from '@/components/assessment/AssessmentHistory';

export default function AssessmentHistoryPage() {
  const navigate = useNavigate();

  const handleBackToIntro = () => {
    navigate('/career-assessment');
  };

  const handleRetakeAssessment = () => {
    navigate('/career-assessment');
  };

  const handleViewResults = (assessmentId: string) => {
    navigate(`/career-assessment/results/${assessmentId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="text-center space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Assessment History
            </h1>
            <p className="text-muted-foreground text-sm sm:text-lg px-4">
              View your past career assessment results and recommendations
            </p>
          </div>
          
          <AssessmentHistory
            onBackToIntro={handleBackToIntro}
            onRetakeAssessment={handleRetakeAssessment}
            onViewResults={handleViewResults}
          />
        </div>
      </div>
    </div>
  );
}
