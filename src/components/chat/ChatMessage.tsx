
import React from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { QuestionCard } from '@/components/career-chat/QuestionCard';
import { OptionCards } from '@/components/career-chat/OptionCards';
import { CareerRecommendationCard } from '@/components/career-chat/message-parts/CareerRecommendationCard';
import { RecommendationSection } from '@/components/career-chat/message-parts/RecommendationSection';
import { UserMessage } from '@/components/career-chat/message-parts/UserMessage';
import { SystemMessage } from '@/components/career-chat/message-parts/SystemMessage';
import { BotMessage } from '@/components/career-chat/message-parts/BotMessage';
import { 
  extractSections, 
  parseStructuredRecommendation 
} from '@/components/career-chat/utils/recommendationParser';
import { StructuredMessage, MessageOption } from '@/types/database/message-types';

interface ChatMessageProps {
  message: CareerChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
  currentQuestionProgress?: number;
}

export function ChatMessage({ message, onSuggestionClick, currentQuestionProgress = 0 }: ChatMessageProps) {
  const isUser = message.message_type === 'user';
  const isRecommendation = message.message_type === 'recommendation';
  const isSystem = message.message_type === 'system';
  
  // Try to parse structured message from metadata (new format)
  const structuredMessage: StructuredMessage | null = 
    message.metadata?.structuredMessage 
      ? (message.metadata.structuredMessage as StructuredMessage) 
      : null;

  // Check if the message is in a numbered list format (1. Option, 2. Option, etc.)
  const hasNumberedList = React.useMemo(() => {
    if (message.message_type !== 'bot') return false;
    
    // Check if message contains numbered list pattern (1. Option)
    const pattern = /\d+\.\s+[A-Za-z]/;
    return pattern.test(message.content);
  }, [message]);
  
  // Parse numbered list options into a structured format
  const parseNumberedOptions = React.useMemo(() => {
    if (!hasNumberedList) return null;
    
    const content = message.content;
    
    // Split into intro/question and options parts
    const parts = content.split(/(\d+\.\s+)/);
    let intro = '';
    let question = '';
    const options: MessageOption[] = [];
    
    if (parts.length > 0) {
      // Extract the text before the first numbered option
      const introText = parts[0].trim();
      
      // Try to split into intro and question if there's a clear question mark
      const questionSplit = introText.split(/(?<=\?)\s+/);
      if (questionSplit.length > 1) {
        intro = questionSplit[0].trim();
        question = questionSplit.slice(1).join(' ').trim();
      } else {
        // Look for sentences ending with question mark
        const questionMatch = introText.match(/([^.!?]+\?)/g);
        if (questionMatch && questionMatch.length > 0) {
          question = questionMatch[questionMatch.length - 1].trim();
          intro = introText.replace(question, '').trim();
        } else {
          // No clear question found, use last sentence as question
          const sentences = introText.split(/(?<=\.|\!)\s+/);
          if (sentences.length > 1) {
            question = sentences.pop() || '';
            intro = sentences.join(' ');
          } else {
            question = introText;
          }
        }
      }
      
      // Parse options
      for (let i = 1; i < parts.length; i += 2) {
        if (i + 1 < parts.length) {
          const optionNumber = parts[i].trim();
          const optionText = parts[i + 1].trim();
          
          if (optionNumber && optionText) {
            options.push({
              id: optionText.toLowerCase().replace(/\s+/g, '-'),
              text: optionText,
              // Assign appropriate icons and categories based on content
              ...getOptionMetadata(optionText)
            });
          }
        }
      }
    }
    
    return {
      intro,
      question,
      options
    };
  }, [message, hasNumberedList]);
  
  // Function to assign appropriate icons and categories based on option content
  function getOptionMetadata(optionText: string): { icon?: string, category?: string } {
    const text = optionText.toLowerCase();
    
    if (text.includes('problem') || text.includes('solving')) {
      return { icon: 'Brain', category: 'skills' };
    }
    if (text.includes('design') || text.includes('build')) {
      return { icon: 'Tool', category: 'skills' };
    }
    if (text.includes('teach') || text.includes('guid') || text.includes('help')) {
      return { icon: 'Users', category: 'social' };
    }
    if (text.includes('research') || text.includes('explor')) {
      return { icon: 'Search', category: 'skills' };
    }
    if (text.includes('manag') || text.includes('organiz')) {
      return { icon: 'List', category: 'workstyle' };
    }
    if (text.includes('creat') || text.includes('innovat')) {
      return { icon: 'Lightbulb', category: 'creative' };
    }
    if (text.includes('other')) {
      return { icon: 'Plus', category: 'general' };
    }
    
    // Default
    return { icon: 'MessageCircle', category: 'general' };
  }
  
  // Handle legacy format detection
  const isQuestion = !structuredMessage && 
    message.message_type === 'bot' && 
    message.metadata && 
    message.metadata.category && 
    message.metadata.hasOptions;
  
  // Check if this message contains raw structured response data
  const hasStructuredData = message.metadata?.rawResponse && 
    message.metadata.rawResponse.type === 'recommendation';
  
  // Get content values for structured messages
  const getQuestionInfo = () => {
    if (structuredMessage?.type === 'question') {
      return {
        question: structuredMessage.content.question || '',
        intro: structuredMessage.content.intro,
        category: structuredMessage.metadata.progress?.category || 'general',
        current: structuredMessage.metadata.progress?.current || 1,
        total: structuredMessage.metadata.progress?.total || 4,
        overall: structuredMessage.metadata.progress?.overall || currentQuestionProgress,
        options: structuredMessage.content.options || [],
        layout: structuredMessage.metadata.options?.layout || 'cards',
        allowMultiple: structuredMessage.metadata.options?.type === 'multiple'
      };
    }
    // Legacy format
    return null;
  };

  // Parse structured question info if available
  const questionInfo = getQuestionInfo();

  // Handle single career recommendation messages
  if (isRecommendation && message.metadata?.career) {
    return (
      <CareerRecommendationCard 
        career={message.metadata.career as string}
        score={message.metadata.score as number}
        description={message.content}
      />
    );
  }
  
  // Handle structured recommendation from raw response
  if (hasStructuredData) {
    const structuredData = parseStructuredRecommendation(message.metadata.rawResponse);
    return <RecommendationSection recommendation={structuredData} onSuggestionClick={onSuggestionClick} />;
  }
  
  // Handle full recommendation message with multiple sections (fallback to text parsing)
  if (isRecommendation && !message.metadata?.career) {
    const sections = extractSections(message.content);
    
    if (sections.type === 'recommendation') {
      return <RecommendationSection recommendation={sections} onSuggestionClick={onSuggestionClick} />;
    }
    
    // If the parser couldn't identify this as a recommendation, display as normal message
    return <BotMessage content={message.content} />;
  }

  // Handle structured question format (new)
  if (questionInfo) {
    return (
      <div className="flex flex-col items-start w-full space-y-6 animate-fade-in">
        <QuestionCard 
          question={questionInfo.question}
          intro={questionInfo.intro}
          category={questionInfo.category}
          questionNumber={questionInfo.current}
          totalQuestions={questionInfo.total}
          progress={questionInfo.overall}
        />
        
        {questionInfo.options.length > 0 && (
          <div className="w-full mt-2">
            <OptionCards 
              options={questionInfo.options}
              onSelect={(option) => onSuggestionClick && onSuggestionClick(option)}
              layout={questionInfo.layout as any}
              allowMultiple={questionInfo.allowMultiple}
            />
          </div>
        )}
      </div>
    );
  }
  
  // Handle detected numbered list format
  if (hasNumberedList && parseNumberedOptions) {
    const { intro, question, options } = parseNumberedOptions;
    
    return (
      <div className="flex flex-col items-start w-full space-y-6 animate-fade-in">
        <QuestionCard 
          question={question}
          intro={intro}
          category={'general'}
          questionNumber={1}
          totalQuestions={4}
          progress={currentQuestionProgress}
        />
        
        {options.length > 0 && (
          <div className="w-full mt-2">
            <OptionCards 
              options={options}
              onSelect={(option) => onSuggestionClick && onSuggestionClick(option)}
              layout="cards"
              allowMultiple={false}
            />
          </div>
        )}
      </div>
    );
  }
  
  // For legacy question and option messages
  if (isQuestion) {
    const category = message.metadata.category as string || 'general';
    const questionNumber = message.metadata.questionNumber as number || 1;
    const totalInCategory = message.metadata.totalInCategory as number || 4;
    const progress = message.metadata.progress as number || currentQuestionProgress;
    const allowMultiple = message.metadata.multiSelect as boolean || false;
    
    // Parse intro and question from the message content
    let intro = '';
    let questionText = message.content;
    
    // Try to extract the intro and actual question from formatted content
    const contentParts = message.content.split(/\*\*Question \d+\/\d+ \([^)]+\):\*\* /);
    if (contentParts.length > 1) {
      intro = contentParts[0].trim();
      questionText = contentParts[1].trim();
    }
    
    return (
      <div className="flex flex-col items-start w-full space-y-6 animate-fade-in">
        <QuestionCard 
          question={questionText}
          intro={intro !== '' ? intro : undefined}
          category={category}
          questionNumber={questionNumber}
          totalQuestions={totalInCategory}
          progress={progress}
        />
        
        {message.metadata.suggestions && message.metadata.suggestions.length > 0 && (
          <div className="w-full mt-2">
            <OptionCards 
              options={message.metadata.suggestions as string[]}
              onSelect={(option) => onSuggestionClick && onSuggestionClick(option)}
              allowMultiple={allowMultiple}
            />
          </div>
        )}
      </div>
    );
  }
  
  // Regular chat messages based on message type
  if (isUser) {
    return <UserMessage content={message.content} />;
  }
  
  if (isSystem) {
    return <SystemMessage content={message.content} />;
  }
  
  // Handle structured conversation (new format)
  if (structuredMessage?.type === 'conversation') {
    return <BotMessage content={structuredMessage.content.intro || message.content} />;
  }
  
  // Default to bot message for anything else
  return <BotMessage content={message.content} />;
}
