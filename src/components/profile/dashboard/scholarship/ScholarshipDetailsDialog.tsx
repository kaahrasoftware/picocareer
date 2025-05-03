
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ScholarshipDetailsDialogProps {
  scholarshipId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScholarshipUpdated?: () => void;
}

export function ScholarshipDetailsDialog({
  scholarshipId,
  open,
  onOpenChange,
  onScholarshipUpdated,
}: ScholarshipDetailsDialogProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { data: scholarship, isLoading } = useQuery({
    queryKey: ["scholarship-details", scholarshipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("id", scholarshipId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open && !!scholarshipId,
  });

  useEffect(() => {
    if (scholarship) {
      setFormData(scholarship);
    }
  }, [scholarship]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const { error } = await supabase
        .from("scholarships")
        .update(updatedData)
        .eq("id", scholarshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Scholarship updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["scholarship-details"] });
      queryClient.invalidateQueries({ queryKey: ["admin-scholarships"] });
      if (onScholarshipUpdated) {
        onScholarshipUpdated();
      }
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">
              {isEditing ? "Edit Scholarship" : "Scholarship Details"}
            </DialogTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(scholarship);
                    }}
                    variant="ghost"
                  >
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" /> Save
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
          <DialogDescription>
            {isEditing ? "Update scholarship information" : "View scholarship details"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider_name">Provider</Label>
                <Input
                  id="provider_name"
                  value={formData.provider_name || ""}
                  onChange={(e) => handleChange("provider_name", e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount || ""}
                    onChange={(e) => handleChange("amount", parseFloat(e.target.value) || null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleChange("deadline", e.target.value ? new Date(e.target.value).toISOString() : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="application_open_date">Opening Date</Label>
                  <Input
                    id="application_open_date"
                    type="date"
                    value={formData.application_open_date ? new Date(formData.application_open_date).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleChange("application_open_date", e.target.value ? new Date(e.target.value).toISOString() : null)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  disabled={!isEditing}
                  rows={5}
                />
              </div>

              {/* Scholarship flags */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured || false}
                    onCheckedChange={(checked) => handleChange("featured", checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="source_verified"
                    checked={formData.source_verified || false}
                    onCheckedChange={(checked) => handleChange("source_verified", checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="source_verified">Source Verified</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="renewable"
                    checked={formData.renewable || false}
                    onCheckedChange={(checked) => handleChange("renewable", checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="renewable">Renewable</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Eligibility Tab */}
          <TabsContent value="eligibility" className="space-y-4 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Eligibility Criteria</h3>
              {/* Add relevant eligibility fields here; this is a simplified version */}
              <div className="space-y-2">
                <Label htmlFor="citizenship">Citizenship Requirements</Label>
                <Input
                  id="citizenship"
                  placeholder="e.g., US Citizens, International Students"
                  value={(formData.citizenship_requirements || []).join(", ")}
                  onChange={(e) => handleChange("citizenship_requirements", e.target.value.split(", "))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demographic">Demographic Requirements</Label>
                <Input
                  id="demographic"
                  placeholder="e.g., First-Generation, Women in STEM"
                  value={(formData.demographic_requirements || []).join(", ")}
                  onChange={(e) => handleChange("demographic_requirements", e.target.value.split(", "))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academic">Academic Requirements</Label>
                <Textarea
                  id="academic"
                  placeholder="Describe academic requirements like GPA, course load, etc."
                  value={formData.academic_requirements ? JSON.stringify(formData.academic_requirements, null, 2) : ""}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handleChange("academic_requirements", parsed);
                    } catch (err) {
                      // Handle invalid JSON input
                      console.log("Invalid JSON");
                    }
                  }}
                  disabled={!isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Enter as valid JSON object
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Application Tab */}
          <TabsContent value="application" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="application_process">Application Process</Label>
                <Textarea
                  id="application_process"
                  value={formData.application_process || ""}
                  onChange={(e) => handleChange("application_process", e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_url">Application URL</Label>
                <Input
                  id="application_url"
                  value={formData.application_url || ""}
                  onChange={(e) => handleChange("application_url", e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="required_documents">Required Documents</Label>
                <Input
                  id="required_documents"
                  placeholder="e.g., Transcripts, Essays, Letters of Recommendation"
                  value={(formData.required_documents || []).join(", ")}
                  onChange={(e) => handleChange("required_documents", e.target.value.split(", "))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="award_frequency">Award Frequency</Label>
                <Select
                  value={formData.award_frequency}
                  onValueChange={(value) => handleChange("award_frequency", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="award_frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="semester">Per Semester</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {!isEditing && (
          <div className="mt-4 pt-2 border-t flex flex-wrap gap-2">
            <Badge variant={formData.featured ? "default" : "outline"}>
              {formData.featured ? "Featured" : "Not Featured"}
            </Badge>
            <Badge variant={formData.source_verified ? "success" : "outline"}>
              {formData.source_verified ? "Verified Source" : "Unverified Source"}
            </Badge>
            <Badge variant={formData.renewable ? "secondary" : "outline"}>
              {formData.renewable ? "Renewable" : "Non-renewable"}
            </Badge>
            <Badge>
              Created: {new Date(formData.created_at).toLocaleDateString()}
            </Badge>
            {formData.views_count !== null && (
              <Badge variant="outline">
                Views: {formData.views_count}
              </Badge>
            )}
            {formData.total_applicants !== null && (
              <Badge variant="outline">
                Applicants: {formData.total_applicants}
              </Badge>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
