
import React, { useEffect, useState, useRef } from 'react';
import { useCareerChat } from './hooks/useCareerChat';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SessionManagementDialog } from './session-management';
import { EmptyState } from './components/EmptyState';
import { ChatInterface } from './components/ChatInterface';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { jsPDF } from 'jspdf';

export function PicoChat() {
  const {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    hasConfigError,
    messagesEndRef,
    currentCategory,
    questionProgress,
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    endCurrentSession,
    startNewSession,
    resumeSession,
    deleteSession,
    updateSessionTitle,
    setInputMessage,
    sendMessage,
    isSessionComplete,
    handleStartNewChat
  } = useCareerChat();
  
  const { toast } = useToast();
  const [configChecked, setConfigChecked] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const [showInitialState, setShowInitialState] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping, localIsTyping]);

  useEffect(() => {
    const checkApiConfig = async () => {
      try {
        const response = await supabase.functions.invoke('career-chat-ai', {
          body: {
            type: 'config-check'
          }
        });
        if (response.error || response.data?.error) {
          toast({
            title: "API Configuration Issue",
            description: "There was a problem with the chat configuration. Please try again later.",
            variant: "destructive",
            duration: 10000
          });
        } else {
          setConfigChecked(true);
        }
      } catch (error) {
        console.error('Failed to check API configuration:', error);
        toast({
          title: "Configuration Check Failed",
          description: "Could not verify the chat API configuration.",
          variant: "destructive",
          duration: 5000
        });
      }
    };
    if (!isLoading && !configChecked) {
      checkApiConfig();
    }
  }, [toast, isLoading, configChecked]);

  useEffect(() => {
    setLocalIsTyping(isTyping);
  }, [isTyping]);

  // Check if we have messages to determine whether to show the empty state
  useEffect(() => {
    if (messages.length > 0 && showInitialState) {
      setShowInitialState(false);
    }
  }, [messages.length]);

  const handleSuggestionClick = (suggestion: string) => {
    if (isSessionComplete && 
        (suggestion.toLowerCase().includes('new') || 
         suggestion.toLowerCase().includes('start'))) {
      handleStartNewChat();
      return;
    }
    
    setLocalIsTyping(true);
    sendMessage(suggestion)
      .catch(() => {
        setLocalIsTyping(false);
      });
  };

  const handleSendMessage = async (msg: string) => {
    setLocalIsTyping(true);
    await sendMessage(msg)
      .catch(() => {
        setLocalIsTyping(false);
      });
  };

  const handleInitiateChat = () => {
    setShowInitialState(false);
    handleStartNewChat();
  };

  const handleViewPastSessions = () => {
    fetchPastSessions();
    setSessionDialogOpen(true);
  };

  const handleDownloadResults = async () => {
    try {
      // Create a PDF document with the chat results
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text("Career Assessment Results", 20, 20);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
      
      // Find recommendation messages
      const recommendationMessages = messages.filter(
        msg => msg.message_type === 'recommendation' || 
               msg.metadata?.rawResponse?.type === 'recommendation' ||
               msg.metadata?.rawResponse?.type === 'assessment_result'
      );
      
      let yPos = 40;
      
      // If we have recommendations
      if (recommendationMessages.length > 0) {
        // Add a section for career recommendations
        doc.setFontSize(16);
        doc.text("Career Recommendations", 20, yPos);
        yPos += 10;
        
        // Extract and add careers
        doc.setFontSize(12);
        recommendationMessages.forEach(msg => {
          if (msg.metadata?.rawResponse?.content?.careers) {
            const careers = msg.metadata.rawResponse.content.careers;
            careers.forEach((career: any, index: number) => {
              // Check if we need a new page
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }
              
              doc.setFont(undefined, 'bold');
              doc.text(`${index + 1}. ${career.title} (${career.match_percentage}% match)`, 20, yPos);
              yPos += 7;
              
              doc.setFont(undefined, 'normal');
              
              // Break description into multiple lines
              const description = career.description;
              const descLines = doc.splitTextToSize(description, 170);
              doc.text(descLines, 20, yPos);
              yPos += 7 * descLines.length + 5;
            });
          }
        });
      }
      
      // Add user responses section
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(16);
      doc.text("Your Assessment Responses", 20, yPos);
      yPos += 10;
      
      // Extract user responses
      const userMessages = messages.filter(msg => msg.message_type === 'user');
      
      doc.setFontSize(12);
      userMessages.forEach((msg, index) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.text(`Q${index + 1}:`, 20, yPos);
        yPos += 7;
        
        doc.setFont(undefined, 'normal');
        const response = msg.content;
        const respLines = doc.splitTextToSize(response, 170);
        doc.text(respLines, 20, yPos);
        yPos += 7 * respLines.length + 5;
      });
      
      // Save the PDF
      doc.save("career-assessment-results.pdf");
      
      toast({
        title: "Download Complete",
        description: "Your career assessment results have been downloaded.",
        duration: 3000
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "There was a problem generating your results PDF.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (hasConfigError) {
    return <ErrorState />;
  }

  return (
    <div className="flex flex-col max-w-6xl mx-auto h-[calc(100vh-120px)] p-4">
      {showInitialState ? (
        <EmptyState 
          onStartChat={handleInitiateChat} 
          onViewPastSessions={handleViewPastSessions} 
        />
      ) : (
        <ChatInterface 
          messages={messages}
          inputMessage={inputMessage}
          isTyping={localIsTyping}
          isAnalyzing={isAnalyzing}
          currentCategory={currentCategory}
          questionProgress={questionProgress}
          isSessionEnded={isSessionComplete}
          messagesEndRef={messagesEndRef}
          onSuggestionClick={handleSuggestionClick}
          onSendMessage={handleSendMessage}
          onStartNewChat={handleStartNewChat}
          onViewPastSessions={handleViewPastSessions}
          onEndCurrentSession={endCurrentSession}
          onDownloadResults={handleDownloadResults}
          setInputMessage={setInputMessage}
        />
      )}
      
      <SessionManagementDialog 
        open={sessionDialogOpen} 
        onOpenChange={setSessionDialogOpen} 
        pastSessions={pastSessions} 
        isFetchingPastSessions={isFetchingPastSessions} 
        onFetchPastSessions={fetchPastSessions} 
        onResumeSession={(sessionId) => {
          resumeSession(sessionId);
          setShowInitialState(false);
          setSessionDialogOpen(false);
        }} 
        onDeleteSession={deleteSession} 
        onUpdateSessionTitle={updateSessionTitle} 
      />
    </div>
  );
}

export default PicoChat;
