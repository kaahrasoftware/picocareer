
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
import { cn } from '@/lib/utils';

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
    // Check if we should use card layout
    const useCardLayout = question.visual_config?.layout === 'cards';
    
    switch (question.type) {
      case 'multiple_choice':
        if (useCardLayout) {
          // Card layout for visual pathway/cluster selection
          return (
            <RadioGroup value={answer} onValueChange={setAnswer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {question.options?.map((option, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "relative cursor-pointer transition-all duration-200 rounded-xl border-2 p-6 space-y-3",
                    answer === option 
                      ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" 
                      : "border-muted hover:border-primary/30 hover:shadow-md hover:scale-[1.01]"
                  )}
                  onClick={() => setAnswer(option)}
                >
                  <RadioGroupItem 
                    value={option} 
                    id={`option-${index}`} 
                    className="absolute top-4 right-4"
                  />
                  <div className="text-3xl mb-2">{question.visual_config?.icon || '🎯'}</div>
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="cursor-pointer text-lg font-semibold block"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );
        }
        
        // Default list layout
        return (
          <RadioGroup value={answer} onValueChange={setAnswer} className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className={`group flex items-center space-x-4 ${isMobile ? 'p-4' : 'p-5'} rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 cursor-pointer ${isMobile ? 'min-h-[52px]' : 'min-h-[56px]'} ${answer === option ? 'border-primary/40 bg-primary/10 shadow-sm' : 'bg-muted/30'}`}>
                <RadioGroupItem 
                  value={option} 
                  id={`option-${index}`} 
                  className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} transition-colors`} 
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className={`cursor-pointer flex-1 ${isMobile ? 'text-base' : 'text-lg'} leading-relaxed font-medium group-hover:text-primary transition-colors`}
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple_select':
        return (
          <div className="space-y-3">
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'} mb-2`}>
              Select all that apply:
            </p>
            {question.options?.map((option, index) => (
              <div key={index} className={`group flex items-center space-x-4 ${isMobile ? 'p-4' : 'p-5'} rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 cursor-pointer ${isMobile ? 'min-h-[52px]' : 'min-h-[56px]'} ${selectedOptions.includes(option) ? 'border-primary/40 bg-primary/10 shadow-sm' : 'bg-muted/30'}`}>
                <Checkbox
                  id={`option-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => 
                    handleMultipleSelect(option, checked as boolean)
                  }
                  className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} transition-colors`}
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className={`cursor-pointer flex-1 ${isMobile ? 'text-base' : 'text-lg'} leading-relaxed font-medium group-hover:text-primary transition-colors`}
                >
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
          <div className={`${isMobile ? 'space-y-8 py-4' : 'space-y-6 py-2'}`}>
            <div className="text-center space-y-2">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20`}>
                <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-primary`}>
                  {currentValue}
                </span>
              </div>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                Current rating
              </p>
            </div>
            <div className={`${isMobile ? 'px-6' : 'px-4'} space-y-4`}>
              <Slider
                value={sliderValue}
                onValueChange={(newValue) => {
                  console.log('Slider value changed to:', newValue);
                  setAnswer(newValue);
                }}
                max={10}
                min={1}
                step={1}
                className={`w-full ${isMobile ? 'h-10' : 'h-8'}`}
              />
              <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground font-medium`}>
                <span>Not at all</span>
                <span>Extremely</span>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-3">
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
              Share your thoughts in detail:
            </p>
            <Textarea
              value={typeof answer === 'string' ? answer : ''}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your response here... The more detail you provide, the better we can tailor your recommendations."
              className={`${isMobile ? 'min-h-[120px] text-base' : 'min-h-[140px] text-lg'} bg-muted/30 border-2 focus:border-primary/40 transition-colors resize-none`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Be as detailed as you like</span>
              <span>{typeof answer === 'string' ? answer.length : 0} characters</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="shadow-xl border-0 overflow-hidden bg-card">
      <CardHeader className={`bg-gradient-to-r from-primary/5 to-secondary/5 ${isMobile ? 'pb-6 px-6' : 'pb-8 px-8'}`}>
        <QuestionTypeIndicator
          questionOrder={question.order}
          profileType={question.profileType}
          targetAudience={question.targetAudience}
          detectedProfileType={detectedProfileType}
        />
        <div className="space-y-3">
          <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} leading-relaxed font-semibold`}>
            {question.title}
          </CardTitle>
          {question.description && (
            <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-lg'} leading-relaxed`}>
              {question.description}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className={`${isMobile ? 'space-y-6 px-6 pb-8' : 'space-y-8 px-8 pb-10'}`}>
        <div className="space-y-2">
          {renderQuestionInput()}
        </div>
        
        <div className={`flex justify-end ${isMobile ? 'pt-6' : 'pt-8'}`}>
          {isLastQuestion ? (
            <Button 
              onClick={onComplete}
              disabled={!isAnswerValid() || isGenerating}
              size="lg"
              className={`${isMobile ? 'w-full min-h-[56px] text-lg' : 'px-12 min-h-[48px]'} bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-medium`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  {isMobile ? 'Creating Your Results...' : 'Generating Your Personalized Results...'}
                </>
              ) : (
                <>
                  <span className="mr-2">🎯</span>
                  Complete Assessment
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!isAnswerValid()}
              size="lg"
              className={`${isMobile ? 'w-full min-h-[56px] text-lg' : 'px-8 min-h-[48px]'} bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Next Question
              <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
