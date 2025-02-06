
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
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
  [key: string]: string | number;
}

export function PersonalityTestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>();

  // Fetch questions from the database
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['personality-test-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personality_test_questions')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data;
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to take the personality test.",
          variant: "destructive",
        });
        return;
      }

      // Save responses
      const responses = Object.entries(data).map(([questionId, answer]) => ({
        profile_id: session.user.id,
        question_id: questionId,
        answer: answer.toString()
      }));

      const { error: responseError } = await supabase
        .from('personality_test_responses')
        .insert(responses);

      if (responseError) throw responseError;

      // Call analyze-personality function
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

      // Redirect to results page
      window.location.href = `/profile?tab=results`;

    } catch (error: any) {
      console.error('Error submitting test:', error);
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

  const renderQuestionField = (question: any) => {
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
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {question.options?.map((option: string) => (
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
                    value={[field.value || 3]}
                    onValueChange={(value) => field.onChange(value[0])}
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
