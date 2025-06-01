
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChatSidebar } from './ChatSidebar';
import { ModernChatInterface } from './redesigned/ModernChatInterface';
import { useCareerChatSimple } from './hooks/useCareerChatSimple';

interface CareerChatInterfaceProps {
  onBackToWelcome: () => void;
}

export function CareerChatInterface({ onBackToWelcome }: CareerChatInterfaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const {
    messages,
    inputMessage,
    isTyping,
    isAnalyzing,
    currentCategory,
    questionProgress,
    isSessionComplete,
    messagesEndRef,
    setInputMessage,
    sendMessage,
    handleStartNewChat,
    handleSuggestionClick,
    handleDownloadResults
  } = useCareerChatSimple();

  return (
    <div className="h-screen flex bg-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBackToWelcome}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Welcome
          </Button>
          <h1 className="text-xl font-semibold">AI Career Assessment</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="w-80 border-r bg-gray-50">
            <ChatSidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          <ModernChatInterface
            messages={messages}
            inputMessage={inputMessage}
            isTyping={isTyping}
            isAnalyzing={isAnalyzing}
            currentCategory={currentCategory}
            questionProgress={questionProgress}
            isSessionComplete={isSessionComplete}
            messagesEndRef={messagesEndRef}
            onSuggestionClick={handleSuggestionClick}
            onSendMessage={sendMessage}
            onStartNewChat={handleStartNewChat}
            onDownloadResults={handleDownloadResults}
            setInputMessage={setInputMessage}
          />
        </div>
      </div>
    </div>
  );
}
