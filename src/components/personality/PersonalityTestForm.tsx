
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuestionField } from "./questions/QuestionField";
import { usePersonalitySubmission } from "./submission/usePersonalitySubmission";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

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
  const [currentPage, setCurrentPage] = useState(0);

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ['personality-test-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personality_test_questions')
        .select('*')
        .order('order_index');
      
      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }

      const questions = data as PersonalityTestQuestion[];
      const defaultValues: FormValues = {};
      questions.forEach(question => {
        defaultValues[question.id] = question.question_type === 'likert_scale' ? '3' : '';
      });
      form.reset(defaultValues);

      return questions;
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

  const questionsPerPage = 2;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);
  const progress = (currentPage / (totalPages - 1)) * 100;

  const onSubmit = (data: FormValues) => {
    handleSubmit(data);
  };

  const nextPage = () => {
    const currentPageValues = currentQuestions.map(q => form.getValues(q.id));
    if (currentPageValues.some(value => !value)) {
      return; // Don't proceed if any question is unanswered
    }
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-500 mt-2 text-center">
          Question {startIndex + 1}-{Math.min(startIndex + questionsPerPage, questions.length)} of {questions.length}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            {currentQuestions.map((question) => (
              <QuestionField 
                key={question.id}
                question={question}
                form={form}
              />
            ))}
          </div>

          <div className="flex justify-between gap-4 mt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={previousPage}
              disabled={currentPage === 0}
              className="w-full"
            >
              Previous
            </Button>

            {currentPage === totalPages - 1 ? (
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
            ) : (
              <Button 
                type="button" 
                onClick={nextPage}
                className="w-full"
              >
                Next
              </Button>
            )}
          </div>
        </form>
      </Form>
    </Card>
  );
}
