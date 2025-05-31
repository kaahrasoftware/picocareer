
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';

interface CareerChatWidgetProps {
  apiKey: string;
  apiBaseUrl?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  onError?: (error: string) => void;
  userId?: string;
  metadata?: Record<string, any>;
}

interface ChatMessage {
  content: string;
  message_type: 'user' | 'bot';
  created_at: string;
}

export function CareerChatWidget({
  apiKey,
  apiBaseUrl = '/supabase/functions/v1',
  position = 'bottom-right',
  theme = {},
  onError,
  userId,
  metadata = {}
}: CareerChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API call failed');
      }

      return response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    }
  };

  const createSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await makeApiCall('/org-api/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId || `widget-user-${Date.now()}`,
          metadata: { ...metadata, source: 'career_chat_widget' }
        }),
      });
      
      setSessionId(result.data.id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create session:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!sessionId || !inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message immediately for better UX
    const newUserMessage: ChatMessage = {
      content: userMessage,
      message_type: 'user',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      setLoading(true);
      setError(null);
      
      await makeApiCall(`/org-api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: userMessage }),
      });

      // Fetch updated messages including AI response
      const messagesResult = await makeApiCall(`/org-api/chat/sessions/${sessionId}/messages`);
      setMessages(messagesResult.data);
      
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove the optimistic user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Initialize session when widget opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession();
    }
  }, [isOpen, sessionId]);

  const themeStyles = {
    backgroundColor: theme.backgroundColor || '#ffffff',
    color: theme.textColor || '#000000',
    '--primary-color': theme.primaryColor || '#9b87f5',
  } as React.CSSProperties;

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {!isOpen ? (
        // Chat bubble trigger
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
          style={{ backgroundColor: theme.primaryColor || '#9b87f5' }}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        // Chat widget
        <Card 
          className={`w-80 ${isMinimized ? 'h-14' : 'h-96'} shadow-xl transition-all duration-200`}
          style={themeStyles}
        >
          <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
            <CardTitle className="text-sm">Career Assistant</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-80">
              {/* Messages area */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    Error: {error}
                  </div>
                )}
                
                {sessionId && messages.length === 0 && !loading && (
                  <div className="text-sm text-muted-foreground">
                    Hi! I'm your career assistant. Ask me about career paths, skills, or job opportunities.
                  </div>
                )}
                
                {messages.map((message, idx) => (
                  <div key={idx} className={`text-sm p-2 rounded-lg max-w-[85%] ${
                    message.message_type === 'user'
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.content}
                  </div>
                ))}
                
                {loading && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="animate-pulse">●</div>
                    Assistant is typing...
                  </div>
                )}
              </div>
              
              {/* Input area */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about careers..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading || !sessionId}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={sendMessage}
                    disabled={loading || !sessionId || !inputMessage.trim()}
                    style={{ backgroundColor: theme.primaryColor || '#9b87f5' }}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
                {sessionId && (
                  <Badge variant="outline" className="text-xs mt-2">
                    Session: {sessionId.slice(0, 8)}...
                  </Badge>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

// Export for embedding in other applications
(window as any).CareerChatWidget = CareerChatWidget;
