
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
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Assessment History</h1>
          <p className="text-muted-foreground text-lg">
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
  );
}
