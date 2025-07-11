
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { AssessmentQuestion, QuestionResponse } from '@/types/assessment';
import { QuestionTypeIndicator } from './QuestionTypeIndicator';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { ArrowRight, Loader2 } from 'lucide-react';

interface QuestionRendererProps {
  question: AssessmentQuestion;
  onAnswer: (response: QuestionResponse) => void;
  onComplete: () => void;
  isGenerating: boolean;
  isLastQuestion?: boolean;
  detectedProfileType?: string | null;
}

export const QuestionRenderer = ({ 
  question, 
  onAnswer, 
  onComplete, 
  isGenerating,
  isLastQuestion = false,
  detectedProfileType
}: QuestionRendererProps) => {
  const { isMobile } = useBreakpoints();
  const getInitialAnswer = (questionType: string) => {
    switch (questionType) {
      case 'scale':
        return [5];
      case 'multiple_select':
        return [];
      default:
        return '';
    }
  };

  const [answer, setAnswer] = useState<any>(() => getInitialAnswer(question.type));
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    console.log('Question changed, resetting state for type:', question.type, 'Question ID:', question.id);
    setAnswer(getInitialAnswer(question.type));
    setSelectedOptions([]);
  }, [question.id, question.type]);

  const handleSubmit = () => {
    let responseValue = answer;
    
    if (question.type === 'multiple_select') {
      responseValue = selectedOptions;
    } else if (question.type === 'scale') {
      responseValue = Array.isArray(answer) ? answer[0] : answer;
    }

    console.log('Submitting answer:', responseValue, 'for question type:', question.type, 'Question ID:', question.id);

    const response: QuestionResponse = {
      questionId: question.id,
      answer: responseValue,
      timestamp: new Date().toISOString()
    };

    onAnswer(response);
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
              <div key={index} className={`flex items-center space-x-2 ${isMobile ? 'p-3' : 'p-2'} rounded hover:bg-gray-50 min-h-[48px]`}>
                <RadioGroupItem value={option} id={`option-${index}`} className={isMobile ? 'w-5 h-5' : ''} />
                <Label htmlFor={`option-${index}`} className={`cursor-pointer flex-1 ${isMobile ? 'text-sm leading-relaxed' : ''}`}>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple_select':
        return (
          <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
            {question.options?.map((option, index) => (
              <div key={index} className={`flex items-center space-x-2 ${isMobile ? 'p-3' : 'p-2'} rounded hover:bg-gray-50 min-h-[48px]`}>
                <Checkbox
                  id={`option-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => 
                    handleMultipleSelect(option, checked as boolean)
                  }
                  className={isMobile ? 'w-5 h-5' : ''}
                />
                <Label htmlFor={`option-${index}`} className={`cursor-pointer flex-1 ${isMobile ? 'text-sm leading-relaxed' : ''}`}>
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'scale':
        const currentValue = Array.isArray(answer) ? answer[0] : 5;
        const sliderValue = Array.isArray(answer) ? answer : [5];
        
        return (
          <div className={`${isMobile ? 'space-y-6 py-2' : 'space-y-4'}`}>
            <div className={`${isMobile ? 'px-4' : 'px-2'}`}>
              <Slider
                value={sliderValue}
                onValueChange={(newValue) => {
                  console.log('Slider value changed to:', newValue);
                  setAnswer(newValue);
                }}
                max={10}
                min={1}
                step={1}
                className={`w-full ${isMobile ? 'h-8' : ''}`}
              />
            </div>
            <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-sm'} text-muted-foreground`}>
              <span>Not at all (1)</span>
              <span className="font-medium">Current: {currentValue}</span>
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
            className={`${isMobile ? 'min-h-[100px] text-sm' : 'min-h-[120px]'}`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className={isMobile ? 'pb-4' : ''}>
        <QuestionTypeIndicator
          questionOrder={question.order}
          profileType={question.profileType}
          targetAudience={question.targetAudience}
          detectedProfileType={detectedProfileType}
        />
        <div className="flex justify-between items-start">
          <CardTitle className={`${isMobile ? 'text-base' : 'text-xl'} leading-relaxed`}>{question.title}</CardTitle>
        </div>
        {question.description && (
          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>{question.description}</p>
        )}
      </CardHeader>
      <CardContent className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
        {renderQuestionInput()}
        
        <div className={`flex justify-end ${isMobile ? 'pt-2' : 'pt-4'}`}>
          {isLastQuestion ? (
            <Button 
              onClick={onComplete}
              disabled={!isAnswerValid() || isGenerating}
              size={isMobile ? "default" : "lg"}
              className={`${isMobile ? 'w-full min-h-[48px]' : 'px-8'}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isMobile ? 'Generating...' : 'Generating Your Results...'}
                </>
              ) : (
                'Complete Assessment'
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!isAnswerValid()}
              size={isMobile ? "default" : "lg"}
              className={isMobile ? 'w-full min-h-[48px]' : ''}
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
