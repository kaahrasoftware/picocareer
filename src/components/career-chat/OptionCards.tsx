
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageOption } from '@/types/database/message-types';
import { ChipsLayout } from './option-cards/ChipsLayout';
import { CardsLayout } from './option-cards/CardsLayout';
import { OptionCardsProps } from './option-cards/types';

export function OptionCards({ options, onSelect, layout = 'cards', allowMultiple = false }: OptionCardsProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

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

  // Reset selection state when options change
  useEffect(() => {
    setSelectedOptions([]);
    setCustomValue('');
    setShowCustomInput(false);
    setIsSelecting(false);
  }, [options]);

  // Function to handle option selection
  const handleSelectOption = (option: MessageOption) => {
    if (isSelecting) {
      return; // Prevent multiple selections while processing
    }

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
      setIsSelecting(true);
      setSelectedOptions([option.text]); // Set visual state 
      
      // Use a small delay to prevent accidental double clicks
      setTimeout(() => {
        onSelect(option.text);
      }, 100);
    }
  };

  // Handle custom value submission
  const handleCustomSubmit = () => {
    if (customValue.trim() && !isSelecting) {
      setIsSelecting(true);
      
      // Small delay to prevent accidental double submission
      setTimeout(() => {
        onSelect(customValue.trim());
      }, 100);
    }
  };

  // Handle custom value change
  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(e.target.value);
  };

  // Submit all selected options when multiple selection is enabled
  const handleSubmitMultiple = () => {
    if (selectedOptions.length > 0 && !isSelecting) {
      setIsSelecting(true);
      
      // Submit all selected options joined by commas
      setTimeout(() => {
        onSelect(selectedOptions.join(', '));
      }, 100);
    }
  };

  // Render appropriate layout based on the layout prop
  if (layout === 'chips') {
    return (
      <ChipsLayout
        options={normalizedOptions}
        selectedOptions={selectedOptions}
        handleSelectOption={handleSelectOption}
        showCustomInput={showCustomInput}
        customValue={customValue}
        handleCustomValueChange={handleCustomValueChange}
        handleCustomSubmit={handleCustomSubmit}
        handleSubmitMultiple={handleSubmitMultiple}
        allowMultiple={allowMultiple}
        isSelecting={isSelecting}
      />
    );
  }

  // Default to cards layout
  return (
    <CardsLayout
      options={normalizedOptions}
      selectedOptions={selectedOptions}
      handleSelectOption={handleSelectOption}
      showCustomInput={showCustomInput}
      customValue={customValue}
      handleCustomValueChange={handleCustomValueChange}
      handleCustomSubmit={handleCustomSubmit}
      handleSubmitMultiple={handleSubmitMultiple}
      allowMultiple={allowMultiple}
      isSelecting={isSelecting}
    />
  );
}
