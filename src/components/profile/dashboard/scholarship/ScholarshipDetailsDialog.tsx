import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
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

  // Safe JSON rendering utility function
  const safeRenderJson = (data: any): string => {
    try {
      if (!data) return "";
      if (typeof data === "string") {
        return data;
      }
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error rendering JSON:", error);
      return "";
    }
  };

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
      // Initialize form data with proper handling for JSON fields
      setFormData({
        ...scholarship,
        // Ensure JSON fields are properly handled
        eligibility_criteria: scholarship.eligibility_criteria || {},
        academic_requirements: scholarship.academic_requirements || {},
        contact_information: scholarship.contact_information || {},
        // Ensure array fields are properly handled
        category: scholarship.category || [],
        tags: scholarship.tags || [],
        citizenship_requirements: scholarship.citizenship_requirements || [],
        demographic_requirements: scholarship.demographic_requirements || [],
        required_documents: scholarship.required_documents || []
      });
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

  const handleJsonFieldChange = (parentField: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      },
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData((prev: any) => {
      const newArray = [...(prev[field] || [])];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const handleArrayAdd = (field: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const handleArrayRemove = (field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSave = () => {
    // Ensure dates are in the correct format
    const formattedData = {
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      application_open_date: formData.application_open_date 
        ? new Date(formData.application_open_date).toISOString() 
        : null,
    };
    
    updateMutation.mutate(formattedData);
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

  // Format a date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

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
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
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
                    value={formData.status || "Active"}
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
                    value={formatDate(formData.deadline)}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="application_open_date">Opening Date</Label>
                  <Input
                    id="application_open_date"
                    type="date"
                    value={formatDate(formData.application_open_date)}
                    onChange={(e) => handleChange("application_open_date", e.target.value)}
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

              <div className="space-y-4">
                <Label>Categories</Label>
                {isEditing ? (
                  <div className="space-y-2">
                    {(formData.category || []).map((cat: string, index: number) => (
                      <div key={`category-${index}`} className="flex items-center gap-2">
                        <Input
                          value={cat}
                          onChange={(e) => handleArrayChange("category", index, e.target.value)}
                          placeholder="Category"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => handleArrayRemove("category", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleArrayAdd("category")}
                    >
                      Add Category
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(formData.category || []).map((cat: string, index: number) => (
                      <Badge key={`category-view-${index}`} variant="outline">{cat}</Badge>
                    ))}
                    {formData.category?.length === 0 && <span className="text-muted-foreground">No categories</span>}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label>Tags</Label>
                {isEditing ? (
                  <div className="space-y-2">
                    {(formData.tags || []).map((tag: string, index: number) => (
                      <div key={`tag-${index}`} className="flex items-center gap-2">
                        <Input
                          value={tag}
                          onChange={(e) => handleArrayChange("tags", index, e.target.value)}
                          placeholder="Tag"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => handleArrayRemove("tags", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleArrayAdd("tags")}
                    >
                      Add Tag
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(formData.tags || []).map((tag: string, index: number) => (
                      <Badge key={`tag-view-${index}`} variant="secondary">{tag}</Badge>
                    ))}
                    {formData.tags?.length === 0 && <span className="text-muted-foreground">No tags</span>}
                  </div>
                )}
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
              
              {/* GPA Requirements */}
              <div className="space-y-2">
                <Label htmlFor="gpa_requirement">GPA Requirement</Label>
                <Input
                  id="gpa_requirement"
                  value={formData.eligibility_criteria?.gpa_requirement || ""}
                  onChange={(e) => handleJsonFieldChange("eligibility_criteria", "gpa_requirement", e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 3.5 or higher"
                />
              </div>

              {/* Academic Year Requirements */}
              <div className="space-y-4">
                <Label>Academic Year Requirements</Label>
                {isEditing ? (
                  <div className="space-y-2">
                    {(formData.eligibility_criteria?.academic_year || []).map((year: string, index: number) => (
                      <div key={`academic-year-${index}`} className="flex items-center gap-2">
                        <Input
                          value={year}
                          onChange={(e) => {
                            const newAcademicYears = [...(formData.eligibility_criteria?.academic_year || [])];
                            newAcademicYears[index] = e.target.value;
                            handleJsonFieldChange("eligibility_criteria", "academic_year", newAcademicYears);
                          }}
                          placeholder="Academic year"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            const newAcademicYears = (formData.eligibility_criteria?.academic_year || [])
                              .filter((_: any, i: number) => i !== index);
                            handleJsonFieldChange("eligibility_criteria", "academic_year", newAcademicYears);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const currentYears = formData.eligibility_criteria?.academic_year || [];
                        handleJsonFieldChange("eligibility_criteria", "academic_year", [...currentYears, ""]);
                      }}
                    >
                      Add Academic Year
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(formData.eligibility_criteria?.academic_year || []).map((year: string, index: number) => (
                      <Badge key={`academic-year-view-${index}`} variant="outline">{year}</Badge>
                    ))}
                    {formData.eligibility_criteria?.academic_year?.length === 0 && 
                      <span className="text-muted-foreground">No academic year requirements specified</span>}
                  </div>
                )}
              </div>

              {/* Citizenship Requirements */}
              <div className="space-y-4">
                <Label>Citizenship Requirements</Label>
                {isEditing ? (
                  <div className="space-y-2">
                    {(formData.citizenship_requirements || []).map((req: string, index: number) => (
                      <div key={`citizenship-${index}`} className="flex items-center gap-2">
                        <Input
                          value={req}
                          onChange={(e) => handleArrayChange("citizenship_requirements", index, e.target.value)}
                          placeholder="Citizenship requirement"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => handleArrayRemove("citizenship_requirements", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleArrayAdd("citizenship_requirements")}
                    >
                      Add Citizenship Requirement
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(formData.citizenship_requirements || []).map((req: string, index: number) => (
                      <Badge key={`citizenship-view-${index}`} variant="outline">{req}</Badge>
                    ))}
                    {formData.citizenship_requirements?.length === 0 && 
                      <span className="text-muted-foreground">No citizenship requirements specified</span>}
                  </div>
                )}
              </div>

              {/* Demographic Requirements */}
              <div className="space-y-4">
                <Label>Demographic Requirements</Label>
                {isEditing ? (
                  <div className="space-y-2">
                    {(formData.demographic_requirements || []).map((req: string, index: number) => (
                      <div key={`demographic-${index}`} className="flex items-center gap-2">
                        <Input
                          value={req}
                          onChange={(e) => handleArrayChange("demographic_requirements", index, e.target.value)}
                          placeholder="Demographic requirement"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => handleArrayRemove("demographic_requirements", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleArrayAdd("demographic_requirements")}
                    >
                      Add Demographic Requirement
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(formData.demographic_requirements || []).map((req: string, index: number) => (
                      <Badge key={`demographic-view-${index}`} variant="outline">{req}</Badge>
                    ))}
                    {formData.demographic_requirements?.length === 0 && 
                      <span className="text-muted-foreground">No demographic requirements specified</span>}
                  </div>
                )}
              </div>

              {/* Other Eligibility Criteria */}
              <div className="space-y-2">
                <Label htmlFor="other_eligibility">Other Eligibility Requirements</Label>
                <Textarea
                  id="other_eligibility"
                  value={formData.eligibility_criteria?.other || ""}
                  onChange={(e) => handleJsonFieldChange("eligibility_criteria", "other", e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Any other eligibility requirements"
                />
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
              
              {/* Required Documents */}
              <div className="space-y-4">
                <Label>Required Documents</Label>
                {isEditing ? (
                  <div className="space-y-2">
                    {(formData.required_documents || []).map((doc: string, index: number) => (
                      <div key={`document-${index}`} className="flex items-center gap-2">
                        <Input
                          value={doc}
                          onChange={(e) => handleArrayChange("required_documents", index, e.target.value)}
                          placeholder="Required document"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => handleArrayRemove("required_documents", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleArrayAdd("required_documents")}
                    >
                      Add Required Document
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(formData.required_documents || []).map((doc: string, index: number) => (
                      <Badge key={`document-view-${index}`} variant="outline">{doc}</Badge>
                    ))}
                    {formData.required_documents?.length === 0 && 
                      <span className="text-muted-foreground">No required documents specified</span>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="award_frequency">Award Frequency</Label>
                <Select
                  value={formData.award_frequency || ""}
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

          {/* Additional Tab */}
          <TabsContent value="additional" className="space-y-4 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Scholarship Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ""}
                  onChange={(e) => handleChange("image_url", e.target.value)}
                  disabled={!isEditing}
                />
                {formData.image_url && !isEditing && (
                  <div className="mt-2 border rounded-md p-2 max-w-xs">
                    <img 
                      src={formData.image_url} 
                      alt="Scholarship" 
                      className="max-h-40 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/300x200?text=Image+Not+Found";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="border p-4 rounded-md space-y-4">
                <h4 className="font-medium">Contact Information</h4>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    value={formData.contact_information?.email || ""}
                    onChange={(e) => handleJsonFieldChange("contact_information", "email", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_information?.phone || ""}
                    onChange={(e) => handleJsonFieldChange("contact_information", "phone", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_website">Contact Website</Label>
                  <Input
                    id="contact_website"
                    value={formData.contact_information?.website || ""}
                    onChange={(e) => handleJsonFieldChange("contact_information", "website", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_information?.contact_person || ""}
                    onChange={(e) => handleJsonFieldChange("contact_information", "contact_person", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.contact_information?.department || ""}
                    onChange={(e) => handleJsonFieldChange("contact_information", "department", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Academic Requirements */}
              <div className="border p-4 rounded-md space-y-4">
                <h4 className="font-medium">Academic Requirements</h4>

                <div className="space-y-2">
                  <Label htmlFor="min_gpa">Minimum GPA</Label>
                  <Input
                    id="min_gpa"
                    type="number"
                    step="0.1"
                    value={formData.academic_requirements?.min_gpa || ""}
                    onChange={(e) => handleJsonFieldChange("academic_requirements", "min_gpa", parseFloat(e.target.value) || null)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enrollment_status">Enrollment Status</Label>
                  <Input
                    id="enrollment_status"
                    value={formData.academic_requirements?.enrollment_status || ""}
                    onChange={(e) => handleJsonFieldChange("academic_requirements", "enrollment_status", e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., Full-time, Part-time"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credits_completed">Credits Completed</Label>
                  <Input
                    id="credits_completed"
                    type="number"
                    value={formData.academic_requirements?.credits_completed || ""}
                    onChange={(e) => handleJsonFieldChange("academic_requirements", "credits_completed", parseInt(e.target.value) || null)}
                    disabled={!isEditing}
                  />
                </div>

                {/* Major Restrictions */}
                <div className="space-y-4">
                  <Label>Major Restrictions</Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {(formData.academic_requirements?.major_restrictions || []).map((major: string, index: number) => (
                        <div key={`major-${index}`} className="flex items-center gap-2">
                          <Input
                            value={major}
                            onChange={(e) => {
                              const newMajors = [...(formData.academic_requirements?.major_restrictions || [])];
                              newMajors[index] = e.target.value;
                              handleJsonFieldChange("academic_requirements", "major_restrictions", newMajors);
                            }}
                            placeholder="Major restriction"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => {
                              const newMajors = (formData.academic_requirements?.major_restrictions || [])
                                .filter((_: any, i: number) => i !== index);
                              handleJsonFieldChange("academic_requirements", "major_restrictions", newMajors);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const currentMajors = formData.academic_requirements?.major_restrictions || [];
                          handleJsonFieldChange("academic_requirements", "major_restrictions", [...currentMajors, ""]);
                        }}
                      >
                        Add Major Restriction
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(formData.academic_requirements?.major_restrictions || []).map((major: string, index: number) => (
                        <Badge key={`major-view-${index}`} variant="outline">{major}</Badge>
                      ))}
                      {(!formData.academic_requirements?.major_restrictions || formData.academic_requirements?.major_restrictions.length === 0) && 
                        <span className="text-muted-foreground">No major restrictions specified</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Scholarship Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Views</div>
                  <div className="text-2xl font-semibold">{formData.views_count || 0}</div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Applicants</div>
                  <div className="text-2xl font-semibold">{formData.total_applicants || 0}</div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Timeline</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">
                      {formData.created_at ? new Date(formData.created_at).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm font-medium">
                      {formData.updated_at ? new Date(formData.updated_at).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Application Opens</span>
                    <span className="text-sm font-medium">
                      {formData.application_open_date ? new Date(formData.application_open_date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Deadline</span>
                    <span className="text-sm font-medium">
                      {formData.deadline ? new Date(formData.deadline).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {formData.author_id && (
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Submitted by</h4>
                  <div className="text-sm">{formData.author_id}</div>
                </div>
              )}
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
