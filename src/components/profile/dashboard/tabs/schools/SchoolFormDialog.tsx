
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface School {
  id: string;
  name: string;
  description: string;
  country: string;
  state: string;
  acceptance_rate: number;
  student_population: number;
  status: "Pending" | "Approved" | "Rejected";
}

interface SchoolFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  school?: School;
}

export function SchoolFormDialog({ open, onClose, onSuccess, school }: SchoolFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    country: "",
    state: "",
    acceptance_rate: 0,
    student_population: 0,
    status: "Pending" as "Pending" | "Approved" | "Rejected",
  });

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || "",
        description: school.description || "",
        country: school.country || "",
        state: school.state || "",
        acceptance_rate: school.acceptance_rate || 0,
        student_population: school.student_population || 0,
        status: school.status || "Pending",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        country: "",
        state: "",
        acceptance_rate: 0,
        student_population: 0,
        status: "Pending",
      });
    }
  }, [school, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        country: formData.country,
        state: formData.state,
        acceptance_rate: formData.acceptance_rate,
        student_population: formData.student_population,
        status: formData.status,
      };

      if (school) {
        const { error } = await supabase
          .from("schools")
          .update(data)
          .eq("id", school.id);

        if (error) throw error;

        toast({
          title: "School updated",
          description: "The school has been successfully updated.",
        });
      } else {
        const { error } = await supabase
          .from("schools")
          .insert([data]);

        if (error) throw error;

        toast({
          title: "School created",
          description: "The school has been successfully created.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving school:", error);
      toast({
        title: "Error",
        description: "There was an error saving the school. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{school ? "Edit School" : "Create New School"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acceptance_rate">Acceptance Rate (%)</Label>
              <Input
                id="acceptance_rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.acceptance_rate}
                onChange={(e) => setFormData({ ...formData, acceptance_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_population">Student Population</Label>
              <Input
                id="student_population"
                type="number"
                min="0"
                value={formData.student_population}
                onChange={(e) => setFormData({ ...formData, student_population: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : school ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
