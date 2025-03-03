import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Bot, MessageCircle, Briefcase, History, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { MainLayout } from '@/router/layouts';
import { useCareerChat } from './hooks/useCareerChat';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useCareerAnalysis } from './hooks/useCareerAnalysis';
import { SessionManagementDialog } from './SessionManagementDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
    addMessage
  } = useCareerChat();
  const {
    toast
  } = useToast();
  const [configChecked, setConfigChecked] = useState(false);
  const [showAnalyzeButton, setShowAnalyzeButton] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);

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
            title: "DeepSeek API Key Not Configured",
            description: "Please contact an administrator to set up the DeepSeek integration.",
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
          description: "Could not verify the DeepSeek API configuration.",
          variant: "destructive",
          duration: 5000
        });
      }
    };
    if (!isLoading && messages.length <= 2 && !configChecked) {
      checkApiConfig();
    }
  }, [toast, messages.length, isLoading, configChecked]);

  useEffect(() => {
    const userMessageCount = messages.filter(msg => msg.message_type === 'user').length;
    if (userMessageCount >= 12 && !isAnalyzing && !showAnalyzeButton) {
      setShowAnalyzeButton(true);
    }
    if (isAnalyzing || messages.some(msg => msg.message_type === 'recommendation')) {
      setShowAnalyzeButton(false);
    }
  }, [messages, isAnalyzing, showAnalyzeButton]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleAnalyzeClick = async () => {
    if (!messages[0]?.session_id) return;
    const {
      analyzeResponses
    } = useCareerAnalysis(messages[0].session_id, addMessage);
    analyzeResponses();
    setShowAnalyzeButton(false);
  };

  const handleStartNewChat = async () => {
    if (messages.length > 2) {
      if (confirm('Starting a new chat will end your current conversation. Continue?')) {
        await startNewSession();
        toast({
          title: "New Conversation Started",
          description: "Your previous conversation has been saved.",
          variant: "default"
        });
      }
    } else {
      await startNewSession();
      toast({
        title: "New Conversation Started",
        description: "Your previous conversation has been saved.",
        variant: "default"
      });
    }
  };

  if (isLoading) {
    return <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>;
  }

  if (hasConfigError) {
    return <MainLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-semibold">AI Chat Unavailable</h2>
          <p className="text-muted-foreground max-w-md">
            The career chat AI service is currently unavailable. Please try again later or contact an administrator.
          </p>
        </div>
      </MainLayout>;
  }

  return <MainLayout>
      <div className="flex flex-col max-w-6xl mx-auto h-[calc(100vh-120px)] p-4">
        {messages.length === 0 || messages.length === 1 && messages[0].message_type === 'system' ? <div className="flex flex-col items-center justify-center h-full space-y-6 text-center px-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-blue-100 flex items-center justify-center mb-4 animate-pulse">
              <Bot className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Hey there... I am Pico!</h1>
            <p className="text-lg text-muted-foreground max-w-md">
              I'm here to help you explore career options and find the perfect path for your skills and interests.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button className="bg-primary hover:bg-primary/90 gap-2 rounded-full px-6 py-6 shadow-sm hover:shadow-md transition-all" size="lg" onClick={() => sendMessage("Hi, I'd like to explore career options")}>
                <MessageCircle className="h-5 w-5" />
                <span>Start Career Chat</span>
              </Button>
              
              <Button className="gap-2 rounded-full px-6 shadow-sm hover:shadow-md transition-all" size="lg" variant="outline" onClick={() => setSessionDialogOpen(true)}>
                <History className="h-5 w-5" />
                <span>Past Conversations</span>
              </Button>
            </div>
          </div> : <div className="flex flex-col h-full bg-gradient-to-br from-blue-50/50 to-white rounded-lg shadow-sm overflow-hidden border">
            <div className="flex items-center justify-between bg-white border-b p-4">
              <div className="flex-1">
                <ChatHeader isAnalyzing={isAnalyzing} currentCategory={currentCategory} />
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <History className="h-4 w-4" />
                      Manage
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleStartNewChat}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      New Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSessionDialogOpen(true)}>
                      <History className="h-4 w-4 mr-2" />
                      Past Conversations
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message, index) => <ChatMessage key={message.id || index} message={message} onSuggestionClick={handleSuggestionClick} currentQuestionProgress={questionProgress} />)}
                
                {showAnalyzeButton && <div className="flex justify-center my-4 animate-fade-in">
                    <Button onClick={handleAnalyzeClick} className="bg-primary hover:bg-primary/90 gap-2 rounded-full px-6 shadow-sm hover:shadow-md transition-all">
                      <Briefcase className="h-5 w-5" />
                      <span>Find Career Matches</span>
                    </Button>
                  </div>}
                
                {isTyping && <ChatTypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <ChatInput inputMessage={inputMessage} setInputMessage={setInputMessage} onSendMessage={sendMessage} isDisabled={isTyping || isAnalyzing} />
          </div>}
        
        <SessionManagementDialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen} pastSessions={pastSessions} isFetchingPastSessions={isFetchingPastSessions} onFetchPastSessions={fetchPastSessions} onResumeSession={resumeSession} onDeleteSession={deleteSession} onUpdateSessionTitle={updateSessionTitle} />
      </div>
    </MainLayout>;
}
export default PicoChat;
