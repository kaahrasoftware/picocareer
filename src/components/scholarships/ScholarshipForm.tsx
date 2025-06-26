import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';

const scholarshipFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  eligibility_criteria: z.string().min(10, {
    message: "Eligibility criteria must be at least 10 characters.",
  }),
  application_open_date: z.date(),
  application_close_date: z.date(),
  award_amount: z.string().refine((value) => {
    // Allow empty string
    if (!value) return true;

    // Check if the value is a valid number
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }, {
    message: "Award amount must be a valid number greater than 0.",
  }).optional(),
  contact_email: z.string().email({
    message: "Invalid email address.",
  }).optional(),
  website_url: z.string().url({
    message: "Invalid URL.",
  }).optional(),
});

type ScholarshipFormData = z.infer<typeof scholarshipFormSchema>;

interface ScholarshipFormProps {
  scholarship?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ScholarshipForm({ scholarship, onSuccess, onCancel }: ScholarshipFormProps) {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScholarshipFormData>({
    resolver: zodResolver(scholarshipFormSchema),
    defaultValues: {
      title: scholarship?.title || "",
      description: scholarship?.description || "",
      eligibility_criteria: scholarship?.eligibility_criteria || "",
      application_open_date: scholarship?.application_open_date ? new Date(scholarship.application_open_date) : new Date(),
      application_close_date: scholarship?.application_close_date ? new Date(scholarship.application_close_date) : new Date(),
      award_amount: scholarship?.award_amount || "",
      contact_email: scholarship?.contact_email || "",
      website_url: scholarship?.website_url || "",
    },
  });

  const onSubmit = async (data: ScholarshipFormData) => {
    setIsSubmitting(true);
    try {
      const processedData = {
        ...data,
        author_id: session?.user?.id || '',
        // Convert Date to ISO string for database
        application_open_date: data.application_open_date instanceof Date 
          ? data.application_open_date.toISOString().split('T')[0]
          : data.application_open_date,
        application_close_date: data.application_close_date instanceof Date
          ? data.application_close_date.toISOString().split('T')[0] 
          : data.application_close_date,
      };

      if (scholarship) {
        const { error } = await supabase
          .from('scholarships')
          .update(processedData)
          .eq('id', scholarship.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('scholarships')
          .insert(processedData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: scholarship ? "Scholarship updated successfully" : "Scholarship created successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" type="text" placeholder="Scholarship Title" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Scholarship Description" {...form.register("description")} />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
        <Textarea id="eligibility_criteria" placeholder="Eligibility Criteria" {...form.register("eligibility_criteria")} />
        {form.formState.errors.eligibility_criteria && (
          <p className="text-sm text-red-500">{form.formState.errors.eligibility_criteria.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Application Open Date</Label>
          <Controller
            control={form.control}
            name="application_open_date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "MMMM d, yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {form.formState.errors.application_open_date && (
            <p className="text-sm text-red-500">{form.formState.errors.application_open_date.message}</p>
          )}
        </div>
        <div>
          <Label>Application Close Date</Label>
          <Controller
            control={form.control}
            name="application_close_date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "MMMM d, yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {form.formState.errors.application_close_date && (
            <p className="text-sm text-red-500">{form.formState.errors.application_close_date.message}</p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="award_amount">Award Amount</Label>
        <Input id="award_amount" type="number" placeholder="Award Amount" {...form.register("award_amount")} />
        {form.formState.errors.award_amount && (
          <p className="text-sm text-red-500">{form.formState.errors.award_amount.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="contact_email">Contact Email</Label>
        <Input id="contact_email" type="email" placeholder="Contact Email" {...form.register("contact_email")} />
        {form.formState.errors.contact_email && (
          <p className="text-sm text-red-500">{form.formState.errors.contact_email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="website_url">Website URL</Label>
        <Input id="website_url" type="url" placeholder="Website URL" {...form.register("website_url")} />
        {form.formState.errors.website_url && (
          <p className="text-sm text-red-500">{form.formState.errors.website_url.message}</p>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}
