
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMenteeDataMutations } from "@/hooks/useMenteeData";
import { useCareersAndMajors } from "@/hooks/useCareersAndMajors";
import { INTEREST_OPTIONS, type InterestCategory } from "./InterestCategoryOptions";
import type { MenteeInterest } from "@/types/mentee-profile";

const interestSchema = z.object({
  category: z.enum(["career", "academic", "extracurricular", "hobby", "industry", "skill"] as const),
  interest_value: z.string().min(1, "Please select an option"),
  description: z.string().optional(),
  proficiency_level: z.string().optional(),
});

type InterestFormData = z.infer<typeof interestSchema>;

interface MenteeInterestFormProps {
  menteeId: string;
  interest?: MenteeInterest | null;
  onClose: () => void;
}

export function MenteeInterestForm({ menteeId, interest, onClose }: MenteeInterestFormProps) {
  const { addInterest, updateInterest } = useMenteeDataMutations();
  const { careers, majors, isLoading } = useCareersAndMajors();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InterestFormData>({
    resolver: zodResolver(interestSchema),
    defaultValues: {
      category: interest?.category || "hobby",
      interest_value: interest?.interest_name || "",
      description: interest?.description || "",
      proficiency_level: interest?.proficiency_level || "not_specified",
    },
  });

  const selectedCategory = form.watch("category") as InterestCategory;

  const onSubmit = async (data: InterestFormData) => {
    setIsSubmitting(true);
    try {
      const interestData = {
        interest_name: data.interest_value, // Store the selected value in interest_name field
        category: data.category,
        mentee_id: menteeId,
        description: data.description || null,
        proficiency_level: data.proficiency_level === "not_specified" ? null : data.proficiency_level || null,
      };

      if (interest) {
        await updateInterest.mutateAsync({ id: interest.id, ...interestData });
      } else {
        await addInterest.mutateAsync(interestData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving interest:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOptionsForCategory = () => {
    switch (selectedCategory) {
      case 'career':
        return careers.map(career => ({ value: career.id, label: career.title }));
      case 'academic':
        return majors.map(major => ({ value: major.id, label: major.title }));
      case 'extracurricular':
      case 'hobby':
      case 'industry':
      case 'skill':
        return INTEREST_OPTIONS[selectedCategory].map(option => ({ value: option, label: option }));
      default:
        return [];
    }
  };

  const options = getOptionsForCategory();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{interest ? "Edit Interest" : "Add Interest"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset interest_value when category changes
                      form.setValue("interest_value", "");
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="extracurricular">Extracurricular</SelectItem>
                      <SelectItem value="hobby">Hobby</SelectItem>
                      <SelectItem value="industry">Industry</SelectItem>
                      <SelectItem value="skill">Skill</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interest_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedCategory === 'career' ? 'Career' :
                     selectedCategory === 'academic' ? 'Major' :
                     selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            isLoading && (selectedCategory === 'career' || selectedCategory === 'academic') 
                              ? "Loading..." 
                              : `Select ${selectedCategory}`
                          } 
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proficiency_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proficiency Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select proficiency level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not_specified">Not specified</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe your interest" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || (isLoading && (selectedCategory === 'career' || selectedCategory === 'academic'))}>
                {isSubmitting ? "Saving..." : interest ? "Update Interest" : "Add Interest"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
