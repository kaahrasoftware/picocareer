
import React, { useState } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { CareerChatWelcome } from '@/components/career-chat/redesigned/CareerChatWelcome';
import { CareerChatInterface } from '@/components/career-chat/CareerChatInterface';
import { AuthPromptDialog } from '@/components/auth/AuthPromptDialog';

export default function CareerChat() {
  const { session, isAuthenticated } = useAuthSession();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [hasStartedAssessment, setHasStartedAssessment] = useState(false);

  const handleStartAssessment = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    
    setHasStartedAssessment(true);
  };

  const handleBackToWelcome = () => {
    setHasStartedAssessment(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthDialog(false);
    setHasStartedAssessment(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {!hasStartedAssessment ? (
        <CareerChatWelcome onStartAssessment={handleStartAssessment} />
      ) : (
        <CareerChatInterface onBackToWelcome={handleBackToWelcome} />
      )}
      
      <AuthPromptDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        title="Sign in to Start Your Career Assessment"
        description="Create an account or sign in to save your progress and access your personalized career recommendations."
        redirectUrl="/career-chat"
      />
    </div>
  );
}
