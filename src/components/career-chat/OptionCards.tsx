
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
        return <IconComponent className="h-5 w-5" />;
      }
    }

    // Fallback to content-based icon selection
    const category = getOptionCategory(option);
    
    switch (category) {
      case 'education':
        return <GraduationCap className="h-5 w-5 text-indigo-500" />;
      case 'skills':
        return <Brain className="h-5 w-5 text-emerald-500" />;
      case 'work':
        return <Briefcase className="h-5 w-5 text-amber-500" />;
      case 'goals':
        return <Target className="h-5 w-5 text-blue-500" />;
      case 'social':
        return <Users className="h-5 w-5 text-violet-500" />;
      case 'time':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'creative':
        return <Palette className="h-5 w-5 text-pink-500" />;
      case 'money':
        return <Settings className="h-5 w-5 text-green-500" />;
      case 'passion':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'leadership':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'innovation':
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      default:
        return <UserRound className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get gradient styles based on the category and selection state
  const getCardStyles = (option: MessageOption, isSelected: boolean) => {
    const category = getOptionCategory(option);
    const baseStyles = {
      bgGradient: '',
      hoverBgGradient: '',
      borderColor: '',
      iconColor: '',
      selectedBgGradient: '',
      selectedBorderColor: '',
      selectedBoxShadow: ''
    };
    
    switch (category) {
      case 'education':
        return {
          bgGradient: 'from-indigo-50 to-white',
          hoverBgGradient: 'hover:from-indigo-100 hover:to-indigo-50/70',
          borderColor: 'border-indigo-200',
          iconColor: 'text-indigo-500',
          selectedBgGradient: 'from-indigo-200 to-indigo-50',
          selectedBorderColor: 'border-indigo-400',
          selectedBoxShadow: 'shadow-indigo-200'
        };
      case 'skills':
        return {
          bgGradient: 'from-emerald-50 to-white',
          hoverBgGradient: 'hover:from-emerald-100 hover:to-emerald-50/70',
          borderColor: 'border-emerald-200',
          iconColor: 'text-emerald-500',
          selectedBgGradient: 'from-emerald-200 to-emerald-50',
          selectedBorderColor: 'border-emerald-400',
          selectedBoxShadow: 'shadow-emerald-200'
        };
      case 'work':
        return {
          bgGradient: 'from-amber-50 to-white',
          hoverBgGradient: 'hover:from-amber-100 hover:to-amber-50/70',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-500',
          selectedBgGradient: 'from-amber-200 to-amber-50',
          selectedBorderColor: 'border-amber-400',
          selectedBoxShadow: 'shadow-amber-200'
        };
      case 'goals':
        return {
          bgGradient: 'from-blue-50 to-white',
          hoverBgGradient: 'hover:from-blue-100 hover:to-blue-50/70',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          selectedBgGradient: 'from-blue-200 to-blue-50',
          selectedBorderColor: 'border-blue-400',
          selectedBoxShadow: 'shadow-blue-200'
        };
      case 'social':
        return {
          bgGradient: 'from-violet-50 to-white',
          hoverBgGradient: 'hover:from-violet-100 hover:to-violet-50/70',
          borderColor: 'border-violet-200',
          iconColor: 'text-violet-500',
          selectedBgGradient: 'from-violet-200 to-violet-50',
          selectedBorderColor: 'border-violet-400',
          selectedBoxShadow: 'shadow-violet-200'
        };
      case 'time':
        return {
          bgGradient: 'from-orange-50 to-white',
          hoverBgGradient: 'hover:from-orange-100 hover:to-orange-50/70',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-500',
          selectedBgGradient: 'from-orange-200 to-orange-50',
          selectedBorderColor: 'border-orange-400',
          selectedBoxShadow: 'shadow-orange-200'
        };
      case 'creative':
        return {
          bgGradient: 'from-pink-50 to-white',
          hoverBgGradient: 'hover:from-pink-100 hover:to-pink-50/70',
          borderColor: 'border-pink-200',
          iconColor: 'text-pink-500',
          selectedBgGradient: 'from-pink-200 to-pink-50',
          selectedBorderColor: 'border-pink-400',
          selectedBoxShadow: 'shadow-pink-200'
        };
      case 'money':
        return {
          bgGradient: 'from-green-50 to-white',
          hoverBgGradient: 'hover:from-green-100 hover:to-green-50/70',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500',
          selectedBgGradient: 'from-green-200 to-green-50',
          selectedBorderColor: 'border-green-400',
          selectedBoxShadow: 'shadow-green-200'
        };
      case 'passion':
        return {
          bgGradient: 'from-red-50 to-white',
          hoverBgGradient: 'hover:from-red-100 hover:to-red-50/70',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          selectedBgGradient: 'from-red-200 to-red-50',
          selectedBorderColor: 'border-red-400',
          selectedBoxShadow: 'shadow-red-200'
        };
      case 'leadership':
        return {
          bgGradient: 'from-yellow-50 to-white',
          hoverBgGradient: 'hover:from-yellow-100 hover:to-yellow-50/70',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          selectedBgGradient: 'from-yellow-200 to-yellow-50',
          selectedBorderColor: 'border-yellow-400',
          selectedBoxShadow: 'shadow-yellow-200'
        };
      case 'innovation':
        return {
          bgGradient: 'from-amber-50 to-white',
          hoverBgGradient: 'hover:from-amber-100 hover:to-amber-50/70',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-500',
          selectedBgGradient: 'from-amber-200 to-amber-50',
          selectedBorderColor: 'border-amber-400',
          selectedBoxShadow: 'shadow-amber-200'
        };
      default:
        return {
          bgGradient: 'from-gray-50 to-white',
          hoverBgGradient: 'hover:from-gray-100 hover:to-gray-50/70',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500',
          selectedBgGradient: 'from-gray-200 to-gray-50',
          selectedBorderColor: 'border-gray-400',
          selectedBoxShadow: 'shadow-gray-200'
        };
    }
  };

  // For chips layout, use a responsively flowing layout
  if (layout === 'chips') {
    return (
      <div className="flex flex-wrap gap-3 w-full max-w-2xl my-5 animate-fade-in">
        {normalizedOptions.map((option) => {
          const isSelected = isOptionSelected(option);
          const styles = getCardStyles(option, isSelected);
          
          return (
            <Button
              key={option.id}
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full border transition-all duration-300",
                isSelected 
                  ? `bg-gradient-to-r ${styles.selectedBgGradient} ${styles.selectedBorderColor} shadow-md`
                  : `bg-gradient-to-r ${styles.bgGradient} ${styles.hoverBgGradient} ${styles.borderColor} hover:shadow-md hover:scale-105`,
                "text-base font-medium",
                "aria-pressed:scale-105 aria-pressed:shadow-md"
              )}
              onClick={() => handleSelectOption(option)}
              aria-pressed={isSelected}
            >
              <span className={cn("mr-1.5", styles.iconColor)}>
                {isSelected ? <Check className="h-4 w-4" /> : getOptionIcon(option)}
              </span>
              <span className="text-gray-800">{option.text}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  // For cards layout, use a grid that adjusts based on the number of options
  const gridCols = normalizedOptions.length <= 2 ? 
    "grid-cols-1 sm:grid-cols-2" : 
    "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  return (
    <div className={`grid ${gridCols} gap-4 w-full max-w-2xl animate-fade-in`}>
      {normalizedOptions.map((option) => {
        const isSelected = isOptionSelected(option);
        const styles = getCardStyles(option, isSelected);
        
        return (
          <button
            key={option.id}
            className={cn(
              "h-auto py-4 px-5 text-left flex flex-col gap-2 rounded-xl",
              "transition-all duration-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isSelected 
                ? `bg-gradient-to-br ${styles.selectedBgGradient} ${styles.selectedBorderColor} shadow-md ${styles.selectedBoxShadow} scale-[1.03]`
                : `bg-gradient-to-br ${styles.bgGradient} ${styles.hoverBgGradient} ${styles.borderColor} hover:shadow-md hover:scale-[1.02]`,
              "border group aria-pressed:scale-[1.03] aria-pressed:shadow-md"
            )}
            onClick={() => handleSelectOption(option)}
            aria-pressed={isSelected}
            role="checkbox"
            aria-checked={isSelected}
          >
            <div className="flex w-full justify-between items-center">
              <div className={cn("flex items-center gap-2.5", styles.iconColor)}>
                {getOptionIcon(option)}
                <span className="font-medium text-base text-gray-800">{option.text}</span>
              </div>
              {isSelected ? (
                <div className={cn("flex items-center justify-center rounded-full h-6 w-6", styles.iconColor, "bg-white/80")}>
                  <Check className="h-4 w-4" />
                </div>
              ) : (
                <ArrowRight className="h-4 w-4 text-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
              )}
            </div>
            {option.description && (
              <p className="text-sm text-gray-600 mt-1 pl-7.5">{option.description}</p>
            )}
          </button>
        );
      })}

      {allowMultiple && selectedOptions.length > 0 && (
        <div className="col-span-full flex justify-center mt-4">
          <Button 
            onClick={() => {
              // Submit all selected options joined by commas
              onSelect(selectedOptions.join(', '));
              setSelectedOptions([]);
            }}
            className="bg-primary hover:bg-primary/90 gap-2 rounded-full px-6 shadow-sm hover:shadow-md transition-all"
          >
            Continue with {selectedOptions.length} selection{selectedOptions.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}
