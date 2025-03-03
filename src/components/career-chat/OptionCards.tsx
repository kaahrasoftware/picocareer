
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, UserRound, Briefcase, GraduationCap, Brain } from 'lucide-react';
import { MessageOption } from '@/types/database/message-types';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface OptionCardsProps {
  options: string[] | MessageOption[];
  onSelect: (option: string) => void;
  layout?: 'buttons' | 'cards' | 'chips';
}

export function OptionCards({ options, onSelect, layout = 'cards' }: OptionCardsProps) {
  // Convert legacy string options to MessageOption format
  const normalizedOptions = options.map((option): MessageOption => {
    if (typeof option === 'string') {
      return {
        id: option.toLowerCase().replace(/\s+/g, '-'),
        text: option,
      };
    }
    return option;
  });

  // Function to get icon from Lucide icons by name
  const getIconByName = (iconName?: string): LucideIcon | null => {
    if (!iconName) return null;
    
    // @ts-ignore - dynamic import from lucide-react
    const LucideIcon = (LucideIcons as any)[iconName];
    return LucideIcon ? LucideIcon : null;
  };

  // Get an appropriate icon based on the option content
  const getOptionIcon = (option: MessageOption) => {
    // First try to use provided icon if available
    if (option.icon) {
      const IconComponent = getIconByName(option.icon);
      if (IconComponent) {
        return <IconComponent className="h-4 w-4 text-indigo-500" />;
      }
    }

    // Fallback to content-based icon selection
    const lowerOption = option.text.toLowerCase();
    
    if (lowerOption.includes('degree') || 
        lowerOption.includes('education') || 
        lowerOption.includes('school') ||
        lowerOption.includes('university') ||
        lowerOption.includes('college')) {
      return <GraduationCap className="h-4 w-4 text-indigo-500" />;
    }
    
    if (lowerOption.includes('skill') || 
        lowerOption.includes('technical') || 
        lowerOption.includes('coding') ||
        lowerOption.includes('analysis') ||
        lowerOption.includes('problem')) {
      return <Brain className="h-4 w-4 text-emerald-500" />;
    }
    
    if (lowerOption.includes('work') || 
        lowerOption.includes('job') || 
        lowerOption.includes('career') ||
        lowerOption.includes('business') ||
        lowerOption.includes('industry')) {
      return <Briefcase className="h-4 w-4 text-amber-500" />;
    }
    
    // Default icon
    return <UserRound className="h-4 w-4 text-gray-500" />;
  };

  if (layout === 'chips') {
    return (
      <div className="flex flex-wrap gap-2 w-full max-w-2xl mb-4 animate-fade-in">
        {normalizedOptions.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            size="sm"
            className="rounded-full border border-blue-100 bg-blue-50/50 hover:bg-blue-100/50 text-sm"
            onClick={() => onSelect(option.text)}
          >
            {getOptionIcon(option)}
            <span className="ml-1">{option.text}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-4 animate-fade-in">
      {normalizedOptions.map((option) => (
        <Button
          key={option.id}
          variant="outline"
          className="h-auto py-3 px-4 text-left flex flex-col items-start gap-1 bg-gradient-to-r from-white to-blue-50/40 hover:to-blue-50 hover:bg-primary/5 border border-blue-100 rounded-lg transition-all shadow-sm hover:shadow group"
          onClick={() => onSelect(option.text)}
        >
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-2">
              {getOptionIcon(option)}
              <span className="font-medium text-gray-800">{option.text}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {option.description && (
            <p className="text-xs text-gray-500 mt-1">{option.description}</p>
          )}
        </Button>
      ))}
    </div>
  );
}
