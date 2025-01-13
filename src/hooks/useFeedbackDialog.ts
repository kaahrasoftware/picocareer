import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useFeedbackDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const feedbackType = searchParams.get('type') as 'mentor_feedback' | 'mentee_feedback';

  const [isOpen, setIsOpen] = useState(!!sessionId);

  const openFeedbackDialog = (newSessionId: string, newFeedbackType: 'mentor_feedback' | 'mentee_feedback') => {
    setSearchParams({ sessionId: newSessionId, type: newFeedbackType });
    setIsOpen(true);
  };

  const closeFeedbackDialog = () => {
    setSearchParams({});
    setIsOpen(false);
  };

  return {
    isOpen,
    sessionId,
    feedbackType,
    openFeedbackDialog,
    closeFeedbackDialog,
  };
}