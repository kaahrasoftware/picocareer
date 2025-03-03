import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, UserRound, Briefcase, GraduationCap, Brain, Target, Users, Clock, Palette, Settings, Heart, Star, Lightbulb } from 'lucide-react';
import { MessageOption } from '@/types/database/message-types';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionCardsProps {
  options: string[] | MessageOption[];
  onSelect: (option: string) => void;
  layout?: 'buttons' | 'cards' | 'chips';
  allowMultiple?: boolean;
}

export function OptionCards({ options, onSelect, layout = 'cards', allowMultiple = false }: OptionCardsProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

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

  // Function to handle option selection
  const handleSelectOption = (option: MessageOption) => {
    if (allowMultiple) {
      // For multiple selection
      setSelectedOptions(prev => {
        const isAlreadySelected = prev.includes(option.text);
        if (isAlreadySelected) {
          return prev.filter(item => item !== option.text);
        } else {
          return [...prev, option.text];
        }
      });
    } else {
      // For single selection, immediately trigger onSelect and show visual feedback briefly
      setSelectedOptions([option.text]);
      
      // Short delay to show selection before submitting
      setTimeout(() => {
        onSelect(option.text);
      }, 300);
    }
  };

  // Check if an option is currently selected
  const isOptionSelected = (option: MessageOption): boolean => {
    return selectedOptions.includes(option.text);
  };

  // Function to get icon from Lucide icons by name
  const getIconByName = (iconName?: string): LucideIcon | null => {
    if (!iconName) return null;
    
    // @ts-ignore - dynamic import from lucide-react
    const LucideIcon = (LucideIcons as any)[iconName];
    return LucideIcon ? LucideIcon : null;
  };

  // Get category based on option content
  const getOptionCategory = (option: MessageOption): string => {
    const lowerOption = option.text.toLowerCase();
    
    if (lowerOption.includes('degree') || 
        lowerOption.includes('education') || 
        lowerOption.includes('school') ||
        lowerOption.includes('university') ||
        lowerOption.includes('college') ||
        lowerOption.includes('learn')) {
      return 'education';
    }
    
    if (lowerOption.includes('skill') || 
        lowerOption.includes('technical') || 
        lowerOption.includes('coding') ||
        lowerOption.includes('analysis') ||
        lowerOption.includes('problem') ||
        lowerOption.includes('programming') ||
        lowerOption.includes('computer')) {
      return 'skills';
    }
    
    if (lowerOption.includes('work') || 
        lowerOption.includes('job') || 
        lowerOption.includes('career') ||
        lowerOption.includes('business') ||
        lowerOption.includes('industry') ||
        lowerOption.includes('professional')) {
      return 'work';
    }
    
    if (lowerOption.includes('goal') ||
        lowerOption.includes('future') ||
        lowerOption.includes('plan') ||
        lowerOption.includes('achieve')) {
      return 'goals';
    }
    
    if (lowerOption.includes('team') ||
        lowerOption.includes('group') ||
        lowerOption.includes('people') ||
        lowerOption.includes('social') ||
        lowerOption.includes('help')) {
      return 'social';
    }
    
    if (lowerOption.includes('time') ||
        lowerOption.includes('schedule') ||
        lowerOption.includes('flexible') ||
        lowerOption.includes('hours')) {
      return 'time';
    }
    
    if (lowerOption.includes('creative') ||
        lowerOption.includes('art') ||
        lowerOption.includes('design') ||
        lowerOption.includes('music')) {
      return 'creative';
    }
    
    if (lowerOption.includes('money') ||
        lowerOption.includes('paid') ||
        lowerOption.includes('salary')) {
      return 'money';
    }
    
    if (lowerOption.includes('love') ||
        lowerOption.includes('passion') ||
        lowerOption.includes('interest')) {
      return 'passion';
    }

    if (lowerOption.includes('leadership') ||
        lowerOption.includes('manage') ||
        lowerOption.includes('lead')) {
      return 'leadership';
    }

    if (lowerOption.includes('idea') ||
        lowerOption.includes('innovation') ||
        lowerOption.includes('thinking') ||
        lowerOption.includes('solution')) {
      return 'innovation';
    }
    
    // Default 
    return 'general';
  };

  // Get an appropriate icon based on the option content
  const getOptionIcon = (option: MessageOption) => {
    // First try to use provided icon if available
    if (option.icon) {
      const IconComponent = getIconByName(option.icon);
      if (IconComponent) {
        return <IconComponent className="h-4 w-4" />;
      }
    }

    // Fallback to content-based icon selection
    const category = getOptionCategory(option);
    
    switch (category) {
      case 'education':
        return <GraduationCap className="h-4 w-4 text-indigo-500" />;
      case 'skills':
        return <Brain className="h-4 w-4 text-emerald-500" />;
      case 'work':
        return <Briefcase className="h-4 w-4 text-amber-500" />;
      case 'goals':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'social':
        return <Users className="h-4 w-4 text-violet-500" />;
      case 'time':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'creative':
        return <Palette className="h-4 w-4 text-pink-500" />;
      case 'money':
        return <Settings className="h-4 w-4 text-green-500" />;
      case 'passion':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'leadership':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'innovation':
        return <Lightbulb className="h-4 w-4 text-amber-500" />;
      default:
        return <UserRound className="h-4 w-4 text-gray-500" />;
    }
  };

  // For chips layout, use a responsively flowing layout with white backgrounds
  if (layout === 'chips') {
    return (
      <div className="flex flex-wrap gap-2 w-full max-w-2xl my-4 animate-fade-in">
        {normalizedOptions.map((option) => {
          const isSelected = isOptionSelected(option);
          
          return (
            <Button
              key={option.id}
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full border transition-all duration-200 bg-white hover:bg-gray-50",
                isSelected 
                  ? "border-primary text-primary shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
                "text-sm font-medium h-8 px-3",
                "aria-pressed:scale-105"
              )}
              onClick={() => handleSelectOption(option)}
              aria-pressed={isSelected}
            >
              <span className="mr-1.5 flex items-center">
                {isSelected ? <Check className="h-3.5 w-3.5" /> : getOptionIcon(option)}
              </span>
              <span className="text-gray-800">{option.text}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  // For cards layout, use a grid that adjusts based on the number of options
  // Use smaller cards with consistent white background
  const gridCols = normalizedOptions.length <= 2 ? 
    "grid-cols-1 sm:grid-cols-2" : 
    "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-3 w-full max-w-3xl animate-fade-in`}>
      {normalizedOptions.map((option) => {
        const isSelected = isOptionSelected(option);
        
        return (
          <button
            key={option.id}
            className={cn(
              "py-3 px-4 text-left flex flex-col gap-1 rounded-lg",
              "transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "bg-white hover:bg-gray-50",
              isSelected 
                ? "border-2 border-primary shadow-sm" 
                : "border border-gray-200 hover:border-gray-300 hover:shadow",
              "group aria-pressed:shadow"
            )}
            onClick={() => handleSelectOption(option)}
            aria-pressed={isSelected}
            role="checkbox"
            aria-checked={isSelected}
          >
            <div className="flex w-full justify-between items-center">
              <div className="flex items-center gap-2">
                {getOptionIcon(option)}
                <span className="font-medium text-sm text-gray-800">{option.text}</span>
              </div>
              {isSelected ? (
                <div className="flex items-center justify-center rounded-full h-5 w-5 bg-primary/10 text-primary">
                  <Check className="h-3 w-3" />
                </div>
              ) : (
                <ArrowRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
              )}
            </div>
            {option.description && (
              <p className="text-xs text-gray-500 mt-1 pl-6">{option.description}</p>
            )}
          </button>
        );
      })}

      {allowMultiple && selectedOptions.length > 0 && (
        <div className="col-span-full flex justify-center mt-3">
          <Button 
            onClick={() => {
              // Submit all selected options joined by commas
              onSelect(selectedOptions.join(', '));
              setSelectedOptions([]);
            }}
            className="bg-primary hover:bg-primary/90 gap-1.5 rounded-full px-4 py-2 text-sm shadow-sm hover:shadow-md transition-all"
          >
            Continue with {selectedOptions.length} selection{selectedOptions.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}
