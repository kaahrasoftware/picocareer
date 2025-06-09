
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useEssayPrompts, useMenteeDataMutations } from "@/hooks/useMenteeData";
import type { MenteeEssayResponse, EssayPrompt } from "@/types/mentee-profile";

const essaySchema = z.object({
  prompt_id: z.string().min(1, "Please select a prompt"),
  response_text: z.string().min(1, "Essay response is required"),
  is_draft: z.boolean(),
});

type EssayFormData = z.infer<typeof essaySchema>;

interface MenteeEssayFormProps {
  menteeId: string;
  essay?: MenteeEssayResponse | null;
  onClose: () => void;
}

export function MenteeEssayForm({ menteeId, essay, onClose }: MenteeEssayFormProps) {
  const { data: prompts = [] } = useEssayPrompts();
  const { addEssayResponse, updateEssayResponse } = useMenteeDataMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [selectedPrompt, setSelectedPrompt] = useState<EssayPrompt | null>(null);

  const form = useForm<EssayFormData>({
    resolver: zodResolver(essaySchema),
    defaultValues: {
      prompt_id: essay?.prompt_id || "",
      response_text: essay?.response_text || "",
      is_draft: essay?.is_draft ?? true,
    },
  });

  const watchedText = form.watch("response_text");
  const watchedPromptId = form.watch("prompt_id");

  useEffect(() => {
    const text = watchedText || "";
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
  }, [watchedText]);

  useEffect(() => {
    const prompt = prompts.find(p => p.id === watchedPromptId);
    setSelectedPrompt(prompt || null);
  }, [watchedPromptId, prompts]);

  const onSubmit = async (data: EssayFormData) => {
    setIsSubmitting(true);
    try {
      const essayData = {
        ...data,
        mentee_id: menteeId,
        word_count: wordCount,
        version: essay ? essay.version + 1 : 1,
      };

      if (essay) {
        await updateEssayResponse.mutateAsync({ id: essay.id, ...essayData });
      } else {
        await addEssayResponse.mutateAsync(essayData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving essay:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverWordLimit = selectedPrompt?.word_limit && wordCount > selectedPrompt.word_limit;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{essay ? "Edit Essay Response" : "Write Essay Response"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="prompt_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Essay Prompt *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!essay}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an essay prompt" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {prompts.map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                          {prompt.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPrompt && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{selectedPrompt.title}</h4>
                  <Badge variant="outline">{selectedPrompt.category.replace('_', ' ')}</Badge>
                  {selectedPrompt.word_limit && (
                    <Badge variant="outline">{selectedPrompt.word_limit} words max</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{selectedPrompt.prompt_text}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="response_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Response *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Write your essay response here..." 
                      rows={15}
                      className="min-h-[300px]"
                    />
                  </FormControl>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`${isOverWordLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
                      Word count: {wordCount}
                      {selectedPrompt?.word_limit && ` / ${selectedPrompt.word_limit}`}
                    </span>
                    {isOverWordLimit && (
                      <span className="text-red-500">Over word limit!</span>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_draft"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Save as Draft</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      You can continue editing draft responses later
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || (isOverWordLimit && !form.getValues('is_draft'))}
              >
                {isSubmitting ? "Saving..." : essay ? "Update Essay" : "Save Essay"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
