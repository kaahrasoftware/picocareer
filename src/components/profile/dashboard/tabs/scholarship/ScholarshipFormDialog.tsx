
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ScholarshipDetails } from "@/types/database/scholarships";

interface ScholarshipFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'add' | 'edit';
  scholarship?: ScholarshipDetails;
}

export function ScholarshipFormDialog({
  open,
  onClose,
  onSuccess,
  mode,
  scholarship
}: ScholarshipFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: scholarship?.title || '',
    description: scholarship?.description || '',
    amount: scholarship?.amount || 0,
    currency: scholarship?.currency || 'USD',
    application_deadline: scholarship?.application_deadline || '',
    eligibility_criteria: scholarship?.eligibility_criteria?.join('\n') || '',
    application_url: scholarship?.application_url || '',
    provider_name: scholarship?.provider_name || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scholarshipData = {
        ...formData,
        eligibility_criteria: formData.eligibility_criteria.split('\n').filter(Boolean),
        status: 'Pending'
      };

      if (mode === 'edit' && scholarship) {
        const { error } = await supabase
          .from('scholarships')
          .update(scholarshipData)
          .eq('id', scholarship.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Scholarship updated successfully." });
      } else {
        const { error } = await supabase
          .from('scholarships')
          .insert(scholarshipData);
        
        if (error) throw error;
        toast({ title: "Success", description: "Scholarship created successfully." });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving scholarship:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save scholarship.",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Scholarship' : 'Add New Scholarship'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="provider_name">Provider Name</Label>
            <Input
              id="provider_name"
              value={formData.provider_name}
              onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="application_url">Application URL</Label>
            <Input
              id="application_url"
              type="url"
              value={formData.application_url}
              onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="application_deadline">Application Deadline</Label>
            <Input
              id="application_deadline"
              type="date"
              value={formData.application_deadline}
              onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="eligibility_criteria">Eligibility Criteria (one per line)</Label>
            <Textarea
              id="eligibility_criteria"
              value={formData.eligibility_criteria}
              onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })}
              placeholder="Enter each criterion on a new line"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
