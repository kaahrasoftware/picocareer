
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface CustomAnswerInputProps {
  promptText: string;
  optionId: string;
  optionText: string;
  onSubmit: (optionId: string, optionText: string, customText: string) => void;
  onCancel: () => void;
}

export function CustomAnswerInput({
  promptText,
  optionId,
  optionText,
  onSubmit,
  onCancel
}: CustomAnswerInputProps) {
  const [customText, setCustomText] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim()) {
      onSubmit(optionId, optionText, customText);
    }
  };
  
  return (
    <div className="custom-answer-container w-full max-w-md mx-auto mt-2 bg-white rounded-lg shadow-md p-4 border border-gray-200 animate-fade-in">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{promptText || "Please specify your answer:"}</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full"
          autoFocus
        />
        
        <div className="flex justify-between gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            size="sm" 
            disabled={!customText.trim()}
            className="flex items-center gap-1"
          >
            Submit <Send className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </form>
    </div>
  );
}
