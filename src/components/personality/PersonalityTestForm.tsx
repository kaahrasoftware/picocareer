
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  Form,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";

interface FormValues {
  [key: string]: string;
}

type QuestionData = {
  id: string;
  question: string;
  question_type: 'multiple_choice' | 'likert_scale' | 'open_ended';
  options?: string[];
  order_index: number;
};

type PersonalityTestQuestion = {
  id: string;
  question: string;
  question_type: 'multiple_choice' | 'likert_scale' | 'open_ended';
  options?: string[];
  order_index: number;
};

export function PersonalityTestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<FormValues>();

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ['personality-test-questions'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('personality_test_questions')
          .select('*')
          .order('order_index');
        
        if (error) throw error;

        if (!data) return [];

        const questions = data as PersonalityTestQuestion[];
        const defaultValues: FormValues = {};
        questions.forEach(question => {
          defaultValues[question.id] = question.question_type === 'likert_scale' ? '3' : '';
        });
        form.reset(defaultValues);

        return questions;
      } catch (err) {
        console.error('Error fetching questions:', err);
        throw err;
      }
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error. Please sign in again.');
      }

      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to take the personality test.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const responses = Object.entries(data).map(([questionId, answer]) => ({
        profile_id: session.user.id,
        question_id: questionId,
        answer: String(answer)
      }));

      const { error: responseError } = await supabase
        .from('personality_test_responses')
        .insert(responses);

      if (responseError) throw responseError;

      const { data: analysis, error: analysisError } = await supabase.functions
        .invoke('analyze-personality', {
          body: {
            responses: data,
            profileId: session.user.id
          }
        });

      if (analysisError) throw analysisError;

      toast({
        title: "Test Completed",
        description: "Your personality test has been analyzed successfully.",
      });

      navigate('/personality-test?tab=results');

    } catch (error: any) {
      console.error('Error submitting test:', error);
      
      if (error.message?.includes('session expired') || error.message?.includes('sign in')) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      toast({
        title: "Error",
        description: error.message || "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>Failed to load personality test questions.</p>
          <p>Please try refreshing the page.</p>
        </div>
      </Card>
    );
  }

  const renderQuestionField = (question: QuestionData) => {
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.question}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {question.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        );

      case 'likert_scale':
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.question}</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[parseInt(field.value || '3', 10)]}
                    onValueChange={(value) => field.onChange(String(value[0]))}
                    className="my-4"
                  />
                </FormControl>
                <FormDescription className="flex justify-between text-sm">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </FormDescription>
              </FormItem>
            )}
          />
        );

      case 'open_ended':
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={question.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{question.question}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Type your answer here..."
                    className="min-h-[100px]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            {questions.map((question) => renderQuestionField(question))}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Submit Test'
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
