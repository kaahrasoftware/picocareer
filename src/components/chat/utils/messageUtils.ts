
import { MessageOption } from '@/types/database/message-types';

export const getOptionMetadata = (optionText: string): { icon?: string, category?: string } => {
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
  
  return { icon: 'MessageCircle', category: 'general' };
};

export const parseNumberedOptions = (content: string): {
  intro: string;
  question: string;
  options: MessageOption[];
} | null => {
  if (!content.match(/\d+\.\s+[A-Za-z]/)) return null;
  
  const parts = content.split(/(\d+\.\s+)/);
  let intro = '';
  let question = '';
  const options: MessageOption[] = [];
  
  if (parts.length > 0) {
    const introText = parts[0].trim();
    const questionSplit = introText.split(/(?<=\?)\s+/);
    
    if (questionSplit.length > 1) {
      intro = questionSplit[0].trim();
      question = questionSplit.slice(1).join(' ').trim();
    } else {
      const questionMatch = introText.match(/([^.!?]+\?)/g);
      if (questionMatch && questionMatch.length > 0) {
        question = questionMatch[questionMatch.length - 1].trim();
        intro = introText.replace(question, '').trim();
      } else {
        const sentences = introText.split(/(?<=\.|\!)\s+/);
        if (sentences.length > 1) {
          question = sentences.pop() || '';
          intro = sentences.join(' ');
        } else {
          question = introText;
        }
      }
    }
    
    for (let i = 1; i < parts.length; i += 2) {
      if (i + 1 < parts.length) {
        const optionNumber = parts[i].trim();
        const optionText = parts[i + 1].trim();
        
        if (optionNumber && optionText) {
          options.push({
            id: optionText.toLowerCase().replace(/\s+/g, '-'),
            text: optionText,
            ...getOptionMetadata(optionText)
          });
        }
      }
    }
  }
  
  return { intro, question, options };
};
