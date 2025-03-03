
import React, { useRef, useEffect } from 'react';
import { usePicoChat } from '@/hooks/usePicoChat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Brain } from 'lucide-react';
import { CareerCard } from '@/components/CareerCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MentorCard } from '@/components/MentorCard';
import { CareerChatMessage } from '@/types/database/analytics';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

export function PicoChat() {
  const {
    messages,
    isLoading,
    isTyping,
    isAnalyzing,
    inputMessage,
    setInputMessage,
    sendMessage,
    analysisResults,
  } = usePicoChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Focus the input field when the component loads
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);
  
  // Handle sending messages with Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 bg-primary text-white flex items-center justify-center">
            <span className="text-lg font-semibold">P</span>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">Pico</h2>
            <p className="text-sm text-muted-foreground">AI Career Guide</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAnalyzing && (
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 animate-pulse text-primary" />
              <span className="text-sm text-muted-foreground">Analyzing responses...</span>
            </div>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={message.id || index} message={message} />
          ))}
          
          {isTyping && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 bg-primary text-white flex items-center justify-center">
                <span className="text-sm font-semibold">P</span>
              </Avatar>
              <div className="flex-1 bg-muted rounded-lg p-3 text-sm">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAnalyzing}
            className="min-h-[60px] resize-none"
          />
          <Button 
            size="icon" 
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isAnalyzing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: CareerChatMessage;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.message_type === 'user';
  const isSystem = message.message_type === 'system';
  const isRecommendation = message.message_type === 'recommendation';
  
  if (isSystem) {
    return (
      <div className="flex justify-center my-6">
        <div className="bg-muted px-4 py-2 rounded-full text-sm text-center">
          {message.content}
        </div>
      </div>
    );
  }
  
  if (isRecommendation) {
    return (
      <div className="mb-6">
        <div className="mb-2 flex justify-center">
          <Badge variant="outline" className="text-sm">
            Career Recommendation
          </Badge>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold">{message.metadata?.career}</h3>
            <Badge>{message.metadata?.score}% Match</Badge>
          </div>
          <div className="p-4">
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className={`h-8 w-8 ${isUser ? 'bg-secondary' : 'bg-primary'} text-white flex items-center justify-center`}>
        <span className="text-sm font-semibold">{isUser ? 'U' : 'P'}</span>
      </Avatar>
      <div className={`flex-1 rounded-lg p-3 text-sm ${isUser ? 'bg-secondary/10' : 'bg-muted'}`}>
        {message.content.split('\n').map((paragraph, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export default PicoChat;
