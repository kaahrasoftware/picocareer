
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuestionField } from "./questions/QuestionField";
import { usePersonalitySubmission } from "./submission/usePersonalitySubmission";

type FormValues = {
  [key: string]: string;
};

type PersonalityTestQuestion = {
  id: string;
  question: string;
  question_type: 'multiple_choice' | 'likert_scale' | 'open_ended';
  options?: string[];
  order_index: number;
};

export function PersonalityTestForm() {
  const form = useForm<FormValues>();
  const { isSubmitting, handleSubmit } = usePersonalitySubmission();

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

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionField 
                key={question.id}
                question={question}
                form={form}
              />
            ))}
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
