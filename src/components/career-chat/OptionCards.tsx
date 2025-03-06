
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { MessageOption } from '@/types/database/message-types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface OptionCardsProps {
  options: string[] | MessageOption[];
  onSelect: (option: string) => void;
  layout?: 'buttons' | 'cards' | 'chips';
  allowMultiple?: boolean;
}

export function OptionCards({ options, onSelect, layout = 'cards', allowMultiple = false }: OptionCardsProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

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

  // Always add "Other" option if not present
  if (!normalizedOptions.some(opt => opt.id === 'other')) {
    normalizedOptions.push({
      id: 'other',
      text: 'Other (specify)',
      icon: 'Plus'
    });
  }

  // Function to handle option selection
  const handleSelectOption = (option: MessageOption) => {
    if (option.id === 'other') {
      setShowCustomInput(true);
      setSelectedOptions([option.text]);
      return;
    }

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
      // For single selection, immediately trigger onSelect
      setSelectedOptions([option.text]); // Set visual state 
      onSelect(option.text); // Immediately trigger callback
    }
  };

  // Handle custom value submission
  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onSelect(customValue.trim());
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  // Submit all selected options when multiple selection is enabled
  const handleSubmitMultiple = () => {
    if (selectedOptions.length > 0) {
      // Submit all selected options joined by commas
      onSelect(selectedOptions.join(', '));
      // Clear selections after submitting
      setSelectedOptions([]);
    }
  };

  // Check if an option is currently selected
  const isOptionSelected = (option: MessageOption): boolean => {
    return selectedOptions.includes(option.text);
  };

  // For chips layout
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
                "text-xs font-medium h-8 px-3",
                "aria-pressed:scale-105"
              )}
              onClick={() => handleSelectOption(option)}
              aria-pressed={isSelected}
              disabled={!allowMultiple && selectedOptions.length > 0 && !isSelected && option.id !== 'other'}
            >
              {isSelected && <span className="mr-1"><Check className="h-3 w-3" /></span>}
              {option.id === 'other' && <Plus className="h-3 w-3 mr-1" />}
              <span className="text-gray-800">{option.text}</span>
            </Button>
          );
        })}
        
        {showCustomInput && (
          <div className="w-full flex gap-2 mt-2">
            <Input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
              autoFocus
            />
            <Button onClick={handleCustomSubmit} type="submit">
              Submit
            </Button>
          </div>
        )}
        
        {allowMultiple && selectedOptions.length > 0 && !showCustomInput && (
          <div className="w-full mt-3">
            <Button 
              onClick={handleSubmitMultiple}
              className="bg-primary hover:bg-primary/90 gap-1.5 rounded-full px-4 py-2 text-xs shadow-sm hover:shadow-md transition-all"
            >
              Continue with {selectedOptions.length} selection{selectedOptions.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // For cards layout
  const gridCols = normalizedOptions.length <= 2 ? 
    "grid-cols-1 sm:grid-cols-2" : 
    "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div className={`grid ${gridCols} gap-3 w-full max-w-3xl`}>
        {normalizedOptions.map((option) => {
          const isSelected = isOptionSelected(option);
          
          return (
            <button
              key={option.id}
              className={cn(
                "py-3 px-4 text-left rounded-lg",
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
              disabled={!allowMultiple && selectedOptions.length > 0 && !isSelected && option.id !== 'other'}
            >
              <div className="flex w-full justify-between items-center">
                <span className="font-medium text-xs text-gray-800">
                  {option.id === 'other' && <Plus className="h-3 w-3 inline mr-1" />}
                  {option.text}
                </span>
                {isSelected ? (
                  <div className="flex items-center justify-center rounded-full h-5 w-5 bg-primary/10 text-primary">
                    <Check className="h-3 w-3" />
                  </div>
                ) : (
                  <ArrowRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                )}
              </div>
              {option.description && (
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              )}
            </button>
          );
        })}
      </div>

      {showCustomInput && (
        <div className="w-full flex gap-2">
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
            autoFocus
          />
          <Button onClick={handleCustomSubmit} type="submit">
            Submit
          </Button>
        </div>
      )}

      {allowMultiple && selectedOptions.length > 0 && !showCustomInput && (
        <div className="flex justify-center mt-3">
          <Button 
            onClick={handleSubmitMultiple}
            className="bg-primary hover:bg-primary/90 gap-1.5 rounded-full px-4 py-2 text-xs shadow-sm hover:shadow-md transition-all"
          >
            Continue with {selectedOptions.length} selection{selectedOptions.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}
