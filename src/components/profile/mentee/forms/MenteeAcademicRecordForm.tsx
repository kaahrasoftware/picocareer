
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMenteeAcademicMutations } from "@/hooks/useMenteeAcademicMutations";
import type { MenteeAcademicRecord } from "@/types/mentee-profile";

const academicRecordSchema = z.object({
  semester: z.enum(["Fall", "Spring", "Summer"]),
  year: z.number().min(1900).max(new Date().getFullYear() + 10),
  semester_gpa: z.number().min(0).max(4.0).optional(),
  cumulative_gpa: z.number().min(0).max(4.0).optional(),
  credits_attempted: z.number().min(0).optional(),
  credits_earned: z.number().min(0).optional(),
  class_rank: z.number().min(1).optional(),
  honors: z.string().optional(),
  awards: z.string().optional(),
});

type AcademicRecordFormData = z.infer<typeof academicRecordSchema>;

interface MenteeAcademicRecordFormProps {
  menteeId: string;
  record?: MenteeAcademicRecord | null;
  onClose: () => void;
}

export function MenteeAcademicRecordForm({ menteeId, record, onClose }: MenteeAcademicRecordFormProps) {
  const { addAcademicRecord, updateAcademicRecord } = useMenteeAcademicMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

  const form = useForm<AcademicRecordFormData>({
    resolver: zodResolver(academicRecordSchema),
    defaultValues: {
      semester: record?.semester as "Fall" | "Spring" | "Summer" || "Fall",
      year: record?.year || currentYear,
      semester_gpa: record?.semester_gpa || undefined,
      cumulative_gpa: record?.cumulative_gpa || undefined,
      credits_attempted: record?.credits_attempted || undefined,
      credits_earned: record?.credits_earned || undefined,
      class_rank: record?.class_rank || undefined,
      honors: record?.honors?.join(", ") || "",
      awards: record?.awards?.join(", ") || "",
    },
  });

  const onSubmit = async (data: AcademicRecordFormData) => {
    setIsSubmitting(true);
    try {
      const recordData = {
        mentee_id: menteeId,
        semester: data.semester,
        year: data.year,
        semester_gpa: data.semester_gpa || null,
        cumulative_gpa: data.cumulative_gpa || null,
        credits_attempted: data.credits_attempted || null,
        credits_earned: data.credits_earned || null,
        class_rank: data.class_rank || null,
        honors: data.honors ? data.honors.split(",").map(h => h.trim()).filter(Boolean) : null,
        awards: data.awards ? data.awards.split(",").map(a => a.trim()).filter(Boolean) : null,
      };

      if (record) {
        await updateAcademicRecord.mutateAsync({ id: record.id, ...recordData });
      } else {
        await addAcademicRecord.mutateAsync(recordData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving academic record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Academic Record" : "Add Academic Record"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="semester_gpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester GPA</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="4.0" 
                        placeholder="3.50"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cumulative_gpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cumulative GPA</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="4.0" 
                        placeholder="3.45"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="credits_attempted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits Attempted</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="15"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credits_earned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits Earned</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="15"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="class_rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Rank</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="25"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="honors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Honors (comma-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Dean's List, Magna Cum Laude" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="awards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Awards (comma-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Outstanding Student Award, Merit Scholarship" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : record ? "Update Record" : "Add Record"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
