
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";

type QuestionData = {
  id: string;
  question: string;
  question_type: 'multiple_choice' | 'likert_scale' | 'open_ended';
  options?: string[];
  order_index: number;
};

interface QuestionFieldProps {
  question: QuestionData;
  form: UseFormReturn<{ [key: string]: string }>;
}

export function QuestionField({ question, form }: QuestionFieldProps) {
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
}
