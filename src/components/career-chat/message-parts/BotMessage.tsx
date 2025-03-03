
import React from 'react';
import { ExternalLink } from 'lucide-react';

interface BotMessageProps {
  content: string;
}

export function BotMessage({ content }: BotMessageProps) {
  // Helper function to convert URLs in text to clickable links
  const renderTextWithLinks = (text: string) => {
    if (!text) return '';
    
    // Regex to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split the text by URLs
    const parts = text.split(urlRegex);
    
    // Find all URLs in the text
    const urls = text.match(urlRegex) || [];
    
    // Combine parts and URLs
    return parts.map((part, i) => {
      // If this part is a URL (it matches with a URL at the same index)
      if (urls[i - 1] === part) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            {part.length > 40 ? part.substring(0, 40) + '...' : part}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      
      // Apply markdown-like formatting
      let formattedPart = part;
      
      // Convert **text** to bold
      formattedPart = formattedPart.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Convert *text* or _text_ to italic
      formattedPart = formattedPart.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
      
      // Convert bullet points
      formattedPart = formattedPart.replace(/^- (.*?)$/gm, '• $1');
      
      return (
        <span 
          key={i} 
          dangerouslySetInnerHTML={{ __html: formattedPart }}
        />
      );
    });
  };

  return (
    <div className="flex flex-col items-start mb-4">
      <div className="max-w-[95%] rounded-lg px-4 py-3 shadow-sm bg-white border border-blue-100 transition-all hover:shadow">
        <div className="text-sm text-gray-700 whitespace-pre-wrap">
          {renderTextWithLinks(content)}
        </div>
      </div>
    </div>
  );
}
