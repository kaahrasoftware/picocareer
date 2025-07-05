
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { AssessmentQuestion, QuestionResponse } from '@/types/assessment';
import { ArrowRight, Loader2 } from 'lucide-react';

interface QuestionRendererProps {
  question: AssessmentQuestion;
  onAnswer: (response: QuestionResponse) => void;
  onComplete: () => void;
  isGenerating: boolean;
  isLastQuestion?: boolean;
}

export const QuestionRenderer = ({ 
  question, 
  onAnswer, 
  onComplete, 
  isGenerating,
  isLastQuestion = false
}: QuestionRendererProps) => {
  // Initialize state based on question type
  const getInitialAnswer = (questionType: string) => {
    switch (questionType) {
      case 'scale':
        return [5]; // Array for slider
      case 'multiple_select':
        return [];
      default:
        return '';
    }
  };

  const [answer, setAnswer] = useState<any>(() => getInitialAnswer(question.type));
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Reset state when question changes
  useEffect(() => {
    console.log('Question changed, resetting state for type:', question.type);
    setAnswer(getInitialAnswer(question.type));
    setSelectedOptions([]);
  }, [question.id, question.type]);

  const handleSubmit = () => {
    let responseValue = answer;
    
    if (question.type === 'multiple_select') {
      responseValue = selectedOptions;
    } else if (question.type === 'scale') {
      // Extract the number from the array
      responseValue = Array.isArray(answer) ? answer[0] : answer;
    }

    console.log('Submitting answer:', responseValue, 'for question type:', question.type);

    const response: QuestionResponse = {
      questionId: question.id,
      answer: responseValue,
      timestamp: new Date().toISOString()
    };

    onAnswer(response);
    
    // Don't reset state here - let useEffect handle it when the next question loads
  };

  const handleMultipleSelect = (option: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, option]);
    } else {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    }
  };

  const isAnswerValid = () => {
    if (question.type === 'multiple_select') {
      return selectedOptions.length > 0;
    }
    if (question.type === 'scale') {
      return Array.isArray(answer) && answer.length > 0;
    }
    if (question.type === 'text') {
      return typeof answer === 'string' && answer.trim() !== '';
    }
    return answer !== '' && answer != null;
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <RadioGroup value={answer} onValueChange={setAnswer}>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple_select':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => 
                    handleMultipleSelect(option, checked as boolean)
                  }
                />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'scale':
        // Ensure we always have an array for the slider
        const currentValue = Array.isArray(answer) ? answer[0] : 5;
        const sliderValue = Array.isArray(answer) ? answer : [5];
        
        console.log('Rendering slider with value:', sliderValue, 'currentValue:', currentValue);
        
        return (
          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={sliderValue}
                onValueChange={(newValue) => {
                  console.log('Slider value changed to:', newValue);
                  setAnswer(newValue);
                }}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Not at all (1)</span>
              <span>Current: {currentValue}</span>
              <span>Extremely (10)</span>
            </div>
          </div>
        );

      case 'text':
        return (
          <Textarea
            value={typeof answer === 'string' ? answer : ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[120px]"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{question.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Question {question.order}
          </div>
        </div>
        {question.description && (
          <p className="text-muted-foreground">{question.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {renderQuestionInput()}
        
        <div className="flex justify-end">
          {isLastQuestion ? (
            <Button 
              onClick={onComplete}
              disabled={!isAnswerValid() || isGenerating}
              size="lg"
              className="px-8"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Results...
                </>
              ) : (
                'Complete Assessment'
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!isAnswerValid()}
              size="lg"
            >
              Next Question
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
