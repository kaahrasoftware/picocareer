
import React from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { Button } from '@/components/ui/button';
import { BookOpen, Briefcase, Users, Brain, Check, Star, Award } from 'lucide-react';

interface ChatMessageProps {
  message: CareerChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatMessage({ message, onSuggestionClick }: ChatMessageProps) {
  const isUser = message.message_type === 'user';
  const isRecommendation = message.message_type === 'recommendation';
  const isSystem = message.message_type === 'system';
  
  const hasSuggestions = message.message_type === 'bot' && 
    message.metadata && 
    message.metadata.hasOptions && 
    Array.isArray(message.metadata.suggestions);
  
  // Handle career recommendation messages
  if (isRecommendation && message.metadata?.career) {
    return (
      <div className="bg-gradient-to-r from-white to-blue-50 border border-primary/20 p-4 rounded-lg shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 text-primary mr-2" />
            <h4 className="font-medium text-lg">{message.metadata.career}</h4>
          </div>
          <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
            {message.metadata.score}% Match
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{message.content}</p>
      </div>
    );
  }
  
  // Extract recommendation sections if this is one big recommendation message
  if (isRecommendation && !message.metadata?.career) {
    // Split the content into career, personality, and mentor sections
    const sections = extractSections(message.content);
    
    return (
      <div className="space-y-4">
        {sections.type === 'recommendation' && (
          <>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                <Star className="h-5 w-5 text-amber-500 mr-2" />
                Career Matches
              </h3>
              <div className="space-y-3">
                {sections.careers.map((career, idx) => (
                  <div key={idx} className="bg-blue-50/50 rounded-md p-3 border border-blue-100">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{career.title}</h4>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        {career.match}% Match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{career.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {sections.personalities.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                  <Brain className="h-5 w-5 text-purple-500 mr-2" />
                  Personality Analysis
                </h3>
                <div className="space-y-3">
                  {sections.personalities.map((personality, idx) => (
                    <div key={idx} className="bg-purple-50/50 rounded-md p-3 border border-purple-100">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{personality.title}</h4>
                        <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                          {personality.match}% Match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{personality.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {sections.mentors.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                  <Users className="h-5 w-5 text-green-500 mr-2" />
                  Recommended Mentors
                </h3>
                <div className="space-y-3">
                  {sections.mentors.map((mentor, idx) => (
                    <div key={idx} className="bg-green-50/50 rounded-md p-3 border border-green-100">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{mentor.name}</h4>
                        {mentor.experience && (
                          <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">
                            {mentor.experience} Experience
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{mentor.skills}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
              <h3 className="text-medium font-medium flex items-center mb-2">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                Next Steps
              </h3>
              <p className="text-sm text-gray-600">
                Would you like to explore any of these career paths in more detail? You can ask specific questions
                about the careers listed or request information about educational requirements, daily responsibilities,
                or how to connect with one of the recommended mentors.
              </p>
            </div>
          </>
        )}
        
        {sections.type === 'unknown' && (
          <div className="max-w-[90%] rounded-lg px-4 py-3 shadow-sm bg-white border">
            <p className="text-sm">{message.content}</p>
          </div>
        )}
      </div>
    );
  }
  
  // Regular chat messages
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-4`}>
      <div 
        className={`max-w-[90%] rounded-lg px-4 py-3 shadow-sm ${
          isUser 
            ? "bg-primary text-primary-foreground" 
            : isSystem 
              ? "bg-muted/80" 
              : "bg-white border"
        }`}
      >
        <p className={`text-sm ${isUser ? "text-primary-foreground" : ""}`}>
          {message.content}
        </p>
      </div>
      
      {hasSuggestions && message.metadata.suggestions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 max-w-[90%]">
          {message.metadata.suggestions.map((suggestion: string, index: number) => (
            <Button 
              key={index}
              variant="outline" 
              size="sm"
              className="justify-start text-sm whitespace-normal h-auto py-2 border-primary/20 hover:bg-primary/5 transition-all"
              onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to extract sections from the recommendation message
function extractSections(content: string) {
  if (!content.includes('Career Recommendations') && 
      !content.includes('Career Matches') && 
      !content.includes('Personality')) {
    // Not a recommendation message
    return { type: 'unknown' };
  }
  
  const careers: Array<{title: string, match: number, reasoning: string}> = [];
  const personalities: Array<{title: string, match: number, description: string}> = [];
  const mentors: Array<{name: string, experience: string, skills: string}> = [];
  
  // Extract career section
  const careerSection = content.split(/Career (Recommendations|Matches)/i)[2]?.split(/Personality (Assessment|Analysis)/i)[0] || '';
  if (careerSection) {
    // Look for patterns like "1. Software Developer (85%)" or "1. Software Developer - 85%"
    const careerMatches = careerSection.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/g) || [];
    
    careerMatches.forEach((match, index) => {
      // Extract title and score
      const titleMatch = match.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const match = parseInt(titleMatch[2] || titleMatch[3] || '0', 10);
        
        // Try to find reasoning - look for text after the career until the next numbered item
        let reasoning = '';
        const startPos = careerSection.indexOf(match) + match.length;
        const nextNumberPos = careerSection.substring(startPos).search(/\d+\.\s+/);
        
        if (nextNumberPos > 0) {
          reasoning = careerSection.substring(startPos, startPos + nextNumberPos).trim();
        } else if (index === careerMatches.length - 1) {
          // For the last item, take all remaining text
          reasoning = careerSection.substring(startPos).trim();
        }
        
        careers.push({
          title,
          match,
          reasoning: reasoning || `Good match based on your skills and preferences.`
        });
      }
    });
  }
  
  // Extract personality section
  const personalitySection = content.split(/Personality (Assessment|Analysis)/i)[1]?.split(/Mentor (Suggestions|Recommendations)/i)[0] || '';
  if (personalitySection) {
    // Similar pattern matching for personality types
    const personalityMatches = personalitySection.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/g) || [];
    
    personalityMatches.forEach((match, index) => {
      const titleMatch = match.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const match = parseInt(titleMatch[2] || titleMatch[3] || '0', 10);
        
        let description = '';
        const startPos = personalitySection.indexOf(match) + match.length;
        const nextNumberPos = personalitySection.substring(startPos).search(/\d+\.\s+/);
        
        if (nextNumberPos > 0) {
          description = personalitySection.substring(startPos, startPos + nextNumberPos).trim();
        } else if (index === personalityMatches.length - 1) {
          description = personalitySection.substring(startPos).trim();
        }
        
        personalities.push({
          title,
          match,
          description: description || `Personality type that matches your profile.`
        });
      }
    });
  }
  
  // Extract mentor section
  const mentorSection = content.split(/Mentor (Suggestions|Recommendations)/i)[1] || '';
  if (mentorSection) {
    // Pattern matching for mentors
    const mentorMatches = mentorSection.match(/\d+\.\s+(.*?)(?:\s*\(|:|\s*-)/g) || [];
    
    mentorMatches.forEach((match, index) => {
      const nameMatch = match.match(/\d+\.\s+(.*?)(?:\s*\(|:|\s*-)/);
      if (nameMatch) {
        const name = nameMatch[1].trim();
        
        let details = '';
        const startPos = mentorSection.indexOf(match) + match.length;
        const nextNumberPos = mentorSection.substring(startPos).search(/\d+\.\s+/);
        
        if (nextNumberPos > 0) {
          details = mentorSection.substring(startPos, startPos + nextNumberPos).trim();
        } else if (index === mentorMatches.length - 1) {
          details = mentorSection.substring(startPos).trim();
        }
        
        // Try to extract experience and skills from details
        const experienceMatch = details.match(/(\d+)\s+years?/i);
        const experience = experienceMatch ? `${experienceMatch[1]} years` : "Experienced";
        
        mentors.push({
          name,
          experience,
          skills: details
        });
      }
    });
  }
  
  return {
    type: 'recommendation',
    careers,
    personalities,
    mentors
  };
}
