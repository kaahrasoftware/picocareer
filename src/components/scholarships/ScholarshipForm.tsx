import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuthSession } from "@/hooks/useAuthSession";

interface ScholarshipFormProps {
  onClose: () => void;
}

export function ScholarshipForm({ onClose }: ScholarshipFormProps) {
  const [formData, setFormData] = useState({
    provider_name: '',
    title: '',
    description: '',
    contact_email: '',
    website_url: '',
    eligibility_criteria: '',
    award_amount: '',
    application_open_date: undefined,
    application_close_date: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scholarshipData = {
        author_id: session?.user.id!,
        provider_name: formData.provider_name || 'Unknown Provider', // Add required field
        title: formData.title,
        description: formData.description,
        contact_email: formData.contact_email,
        website_url: formData.website_url,
        eligibility_criteria: formData.eligibility_criteria,
        award_amount: formData.award_amount,
        application_open_date: formData.application_open_date,
        application_close_date: formData.application_close_date
      };

      const { error } = await supabase
        .from('scholarships')
        .insert(scholarshipData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scholarship created successfully",
      });

      onClose();
    } catch (error) {
      console.error('Error creating scholarship:', error);
      toast({
        title: "Error",
        description: "Failed to create scholarship",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Add provider_name field */}
      <div>
        <label htmlFor="provider_name" className="block text-sm font-medium text-gray-700">
          Provider Name *
        </label>
        <input
          type="text"
          id="provider_name"
          value={formData.provider_name || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="contact_email">Contact Email</Label>
        <Input
          type="email"
          id="contact_email"
          value={formData.contact_email}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="website_url">Website URL</Label>
        <Input
          type="url"
          id="website_url"
          value={formData.website_url}
          onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
        <Textarea
          id="eligibility_criteria"
          value={formData.eligibility_criteria}
          onChange={(e) => setFormData(prev => ({ ...prev, eligibility_criteria: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="award_amount">Award Amount</Label>
        <Input
          type="text"
          id="award_amount"
          value={formData.award_amount}
          onChange={(e) => setFormData(prev => ({ ...prev, award_amount: e.target.value }))}
        />
      </div>

      <div className="flex space-x-2">
        <div className="w-1/2">
          <Label htmlFor="application_open_date">Application Open Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.application_open_date && "text-muted-foreground"
                )}
              >
                {formData.application_open_date ? (
                  format(formData.application_open_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.application_open_date}
                onSelect={(date) => setFormData(prev => ({ ...prev, application_open_date: date }))}
                disabled={(date) =>
                  date > new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-1/2">
          <Label htmlFor="application_close_date">Application Close Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.application_close_date && "text-muted-foreground"
                )}
              >
                {formData.application_close_date ? (
                  format(formData.application_close_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.application_close_date}
                onSelect={(date) => setFormData(prev => ({ ...prev, application_close_date: date }))}
                disabled={(date) =>
                  date > new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Scholarship"}
      </Button>
    </form>
  );
}
