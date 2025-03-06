
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageOption } from '@/types/database/message-types';
import { ChipsLayout } from './option-cards/ChipsLayout';
import { CardsLayout } from './option-cards/CardsLayout';
import { OptionCardsProps } from './option-cards/types';

export function OptionCards({ 
  options, 
  onSelect, 
  layout = 'cards', 
  allowMultiple = false,
  disabled = false
}: OptionCardsProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [processingClick, setProcessingClick] = useState(false);

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

  // Add "Other" option if not present and not disabled
  const finalOptions = !normalizedOptions.some(opt => opt.id === 'other' || opt.text === 'Other (specify)') && !disabled
    ? [...normalizedOptions, {
        id: 'other',
        text: 'Other (specify)',
        icon: 'Plus'
      }]
    : normalizedOptions;

  // Reset selection state when options change or when disabled changes
  useEffect(() => {
    setSelectedOptions([]);
    setCustomValue('');
    setShowCustomInput(false);
    setIsSelecting(false);
    setProcessingClick(false);
  }, [options, disabled]);

  // Function to handle option selection with debouncing
  const handleSelectOption = (option: MessageOption) => {
    if (isSelecting || disabled || processingClick) {
      return; // Prevent selection when processing or disabled
    }

    // Handle "Other" option specially
    if (option.id === 'other' || option.text === 'Other (specify)') {
      setShowCustomInput(true);
      setSelectedOptions([option.text]);
      return;
    }

    // Immediately set processing state to prevent double-clicks
    setProcessingClick(true);

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
      // For single selection, show visual feedback first
      setIsSelecting(true);
      setSelectedOptions([option.text]);
      
      // Add a short delay for visual feedback before triggering onSelect
      setTimeout(() => {
        onSelect(option.text);
      }, 200);
    }
  };

  // Handle custom value submission
  const handleCustomSubmit = () => {
    if (customValue.trim() && !isSelecting && !disabled && !processingClick) {
      setIsSelecting(true);
      setProcessingClick(true);
      
      setTimeout(() => {
        onSelect(customValue.trim());
      }, 200);
    }
  };

  // Handle custom value change
  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(e.target.value);
  };

  // Submit all selected options when multiple selection is enabled
  const handleSubmitMultiple = () => {
    if (selectedOptions.length > 0 && !isSelecting && !disabled && !processingClick) {
      setIsSelecting(true);
      setProcessingClick(true);
      
      setTimeout(() => {
        onSelect(selectedOptions.join(', '));
      }, 200);
    }
  };

  // Render appropriate layout based on the layout prop
  if (layout === 'chips') {
    return (
      <ChipsLayout
        options={finalOptions}
        selectedOptions={selectedOptions}
        handleSelectOption={handleSelectOption}
        showCustomInput={showCustomInput}
        customValue={customValue}
        handleCustomValueChange={handleCustomValueChange}
        handleCustomSubmit={handleCustomSubmit}
        handleSubmitMultiple={handleSubmitMultiple}
        allowMultiple={allowMultiple}
        isSelecting={isSelecting}
        disabled={disabled}
      />
    );
  }

  // Default to cards layout
  return (
    <CardsLayout
      options={finalOptions}
      selectedOptions={selectedOptions}
      handleSelectOption={handleSelectOption}
      showCustomInput={showCustomInput}
      customValue={customValue}
      handleCustomValueChange={handleCustomValueChange}
      handleCustomSubmit={handleCustomSubmit}
      handleSubmitMultiple={handleSubmitMultiple}
      allowMultiple={allowMultiple}
      isSelecting={isSelecting}
      disabled={disabled}
    />
  );
}
