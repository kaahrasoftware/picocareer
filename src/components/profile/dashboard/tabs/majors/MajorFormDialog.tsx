
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Major } from "@/types/database/majors";

interface MajorFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  major?: Major;
}

export function MajorFormDialog({ open, onClose, onSuccess, major }: MajorFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    featured: false,
    status: "Pending" as "Pending" | "Approved" | "Rejected",
    token_cost: 0,
  });

  useEffect(() => {
    if (major) {
      setFormData({
        title: major.title || "",
        description: major.description || "",
        featured: major.featured || false,
        status: major.status || "Pending",
        token_cost: major.token_cost || 0,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        featured: false,
        status: "Pending",
        token_cost: 0,
      });
    }
  }, [major, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        title: formData.title,
        description: formData.description,
        featured: formData.featured,
        status: formData.status,
        token_cost: formData.token_cost,
      };

      if (major) {
        const { error } = await supabase
          .from("majors")
          .update(data)
          .eq("id", major.id);

        if (error) throw error;

        toast({
          title: "Major updated",
          description: "The major has been successfully updated.",
        });
      } else {
        const { error } = await supabase
          .from("majors")
          .insert([data]);

        if (error) throw error;

        toast({
          title: "Major created",
          description: "The major has been successfully created.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving major:", error);
      toast({
        title: "Error",
        description: "There was an error saving the major. Please try again.",
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
          <DialogTitle>{major ? "Edit Major" : "Create New Major"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

          <div className="space-y-2">
            <Label htmlFor="token_cost">Token Cost</Label>
            <Input
              id="token_cost"
              type="number"
              value={formData.token_cost}
              onChange={(e) => setFormData({ ...formData, token_cost: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
            <Label htmlFor="featured">Featured</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : major ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
