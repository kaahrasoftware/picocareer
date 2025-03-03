
import React from 'react';
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

  // Get gradient styles based on the category
  const getCardStyles = (option: MessageOption) => {
    const category = getOptionCategory(option);
    
    switch (category) {
      case 'education':
        return {
          bgGradient: 'from-indigo-50 to-white',
          hoverBgGradient: 'hover:from-indigo-100 hover:to-indigo-50/70',
          borderColor: 'border-indigo-200',
          iconColor: 'text-indigo-500'
        };
      case 'skills':
        return {
          bgGradient: 'from-emerald-50 to-white',
          hoverBgGradient: 'hover:from-emerald-100 hover:to-emerald-50/70',
          borderColor: 'border-emerald-200',
          iconColor: 'text-emerald-500'
        };
      case 'work':
        return {
          bgGradient: 'from-amber-50 to-white',
          hoverBgGradient: 'hover:from-amber-100 hover:to-amber-50/70',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-500'
        };
      case 'goals':
        return {
          bgGradient: 'from-blue-50 to-white',
          hoverBgGradient: 'hover:from-blue-100 hover:to-blue-50/70',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500'
        };
      case 'social':
        return {
          bgGradient: 'from-violet-50 to-white',
          hoverBgGradient: 'hover:from-violet-100 hover:to-violet-50/70',
          borderColor: 'border-violet-200',
          iconColor: 'text-violet-500'
        };
      case 'time':
        return {
          bgGradient: 'from-orange-50 to-white',
          hoverBgGradient: 'hover:from-orange-100 hover:to-orange-50/70',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-500'
        };
      case 'creative':
        return {
          bgGradient: 'from-pink-50 to-white',
          hoverBgGradient: 'hover:from-pink-100 hover:to-pink-50/70',
          borderColor: 'border-pink-200',
          iconColor: 'text-pink-500'
        };
      case 'money':
        return {
          bgGradient: 'from-green-50 to-white',
          hoverBgGradient: 'hover:from-green-100 hover:to-green-50/70',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500'
        };
      case 'passion':
        return {
          bgGradient: 'from-red-50 to-white',
          hoverBgGradient: 'hover:from-red-100 hover:to-red-50/70',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500'
        };
      case 'leadership':
        return {
          bgGradient: 'from-yellow-50 to-white',
          hoverBgGradient: 'hover:from-yellow-100 hover:to-yellow-50/70',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500'
        };
      case 'innovation':
        return {
          bgGradient: 'from-amber-50 to-white',
          hoverBgGradient: 'hover:from-amber-100 hover:to-amber-50/70',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-500'
        };
      default:
        return {
          bgGradient: 'from-gray-50 to-white',
          hoverBgGradient: 'hover:from-gray-100 hover:to-gray-50/70',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500'
        };
    }
  };

  // For chips layout, use a responsively flowing layout
  if (layout === 'chips') {
    return (
      <div className="flex flex-wrap gap-3 w-full max-w-2xl my-5 animate-fade-in">
        {normalizedOptions.map((option) => {
          const styles = getCardStyles(option);
          
          return (
            <Button
              key={option.id}
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full border transition-all duration-300",
                `bg-gradient-to-r ${styles.bgGradient} ${styles.hoverBgGradient}`,
                `${styles.borderColor} hover:shadow-md hover:scale-105`,
                "text-base font-medium"
              )}
              onClick={() => onSelect(option.text)}
            >
              <span className={cn("mr-1.5", styles.iconColor)}>
                {getOptionIcon(option)}
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
    <div className={`grid ${gridCols} gap-4 w-full max-w-2xl my-5 animate-fade-in`}>
      {normalizedOptions.map((option) => {
        const styles = getCardStyles(option);
        
        return (
          <button
            key={option.id}
            className={cn(
              "h-auto py-4 px-5 text-left flex flex-col gap-2 rounded-xl",
              `bg-gradient-to-br ${styles.bgGradient} ${styles.hoverBgGradient}`,
              `border ${styles.borderColor}`,
              "shadow-sm hover:shadow-md transition-all duration-300",
              "hover:scale-[1.02] group"
            )}
            onClick={() => onSelect(option.text)}
          >
            <div className="flex w-full justify-between items-center">
              <div className={cn("flex items-center gap-2.5", styles.iconColor)}>
                {getOptionIcon(option)}
                <span className="font-medium text-base text-gray-800">{option.text}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
            </div>
            {option.description && (
              <p className="text-sm text-gray-600 mt-1 pl-7.5">{option.description}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
