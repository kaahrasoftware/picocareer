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
import { Loader2, Save, X, Plus, Minus } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScholarshipDetailsDialogProps {
  scholarshipId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScholarshipUpdated?: () => void;
}

interface ScholarshipDetails {
  id: string;
  title: string;
  provider_name: string;
  description: string;
  amount: number | null;
  currency: string | null;
  deadline: string | null;
  eligibility_criteria: any | null;
  application_url: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  featured: boolean;
  source_verified: boolean;
  views_count: number | null;
  total_applicants: number | null;
  category: string[] | null;
  tags: string[] | null;
  required_documents: string[] | null;
  citizenship_requirements: string[] | null;
  demographic_requirements: string[] | null;
  academic_requirements: any | null;
  application_process: string | null;
  application_open_date: string | null;
  award_frequency: string | null;
  contact_information: any | null;
  renewable: boolean;
}

export function ScholarshipDetailsDialog({
  scholarshipId,
  open,
  onOpenChange,
  onScholarshipUpdated
}: ScholarshipDetailsDialogProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ScholarshipDetails>>({});
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [activeTab, setActiveTab] = useState("basic");

  const { data: scholarship, isLoading, error } = useQuery({
    queryKey: ["scholarship-details", scholarshipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("id", scholarshipId)
        .single();

      if (error) throw error;
      
      // Initialize any potentially null JSON fields with defaults
      return {
        ...data,
        eligibility_criteria: data.eligibility_criteria || {},
        academic_requirements: data.academic_requirements || {},
        contact_information: data.contact_information || {},
        category: data.category || [],
        tags: data.tags || [],
        required_documents: data.required_documents || [],
        citizenship_requirements: data.citizenship_requirements || [],
        demographic_requirements: data.demographic_requirements || []
      };
    },
    enabled: open && !!scholarshipId,
  });

  useEffect(() => {
    if (scholarship) {
      setFormData(scholarship);
    }
  }, [scholarship]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<ScholarshipDetails>) => {
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
    onError: (error: any) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleJsonFieldChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev?.[parent] as object || {}),
        [field]: value
      }
    }));
  };

  const handleArrayItemChange = (field: string, index: number, value: string) => {
    setFormData((prev) => {
      const array = [...(prev[field] as string[] || [])];
      array[index] = value;
      return { ...prev, [field]: array };
    });
  };

  const addArrayItem = (field: string) => {
    setFormData((prev) => {
      const array = [...(prev[field] as string[] || [])];
      array.push("");
      return { ...prev, [field]: array };
    });
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev) => {
      const array = [...(prev[field] as string[] || [])];
      array.splice(index, 1);
      return { ...prev, [field]: array };
    });
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Required fields
    if (!formData.title) errors.title = "Title is required";
    if (!formData.provider_name) errors.provider_name = "Provider name is required";
    
    // Validate JSON fields
    try {
      if (typeof formData.eligibility_criteria === 'string') {
        JSON.parse(formData.eligibility_criteria);
      }
    } catch (e) {
      errors.eligibility_criteria = "Invalid JSON format";
    }
    
    try {
      if (typeof formData.academic_requirements === 'string') {
        JSON.parse(formData.academic_requirements);
      }
    } catch (e) {
      errors.academic_requirements = "Invalid JSON format";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Please fix form errors before saving");
      return;
    }

    // Process data before saving
    const dataToUpdate = { ...formData };
    
    // Ensure arrays are properly formatted
    ['tags', 'category', 'required_documents', 'citizenship_requirements', 'demographic_requirements'].forEach(field => {
      if (dataToUpdate[field] && Array.isArray(dataToUpdate[field])) {
        // Remove empty strings from arrays
        dataToUpdate[field] = (dataToUpdate[field] as string[]).filter(item => item.trim() !== '');
      }
    });

    // Process JSON fields
    ['eligibility_criteria', 'academic_requirements', 'contact_information'].forEach(field => {
      if (typeof dataToUpdate[field] === 'string') {
        try {
          dataToUpdate[field] = JSON.parse(dataToUpdate[field] as string);
        } catch (e) {
          // If invalid JSON, try to keep the original
          dataToUpdate[field] = scholarship?.[field] || {};
        }
      }
    });

    updateMutation.mutate(dataToUpdate);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(scholarship || {});
    setFormErrors({});
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString();
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Not specified";
    return `$${amount.toLocaleString()}`;
  };

  // Function to render an array as input fields
  const renderArrayEditor = (field: string, label: string) => {
    const array = formData[field] as string[] || [];
    
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        {array.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Input 
              value={item}
              onChange={(e) => handleArrayItemChange(field, index, e.target.value)}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => removeArrayItem(field, index)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(field)}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>
    );
  };

  // Function to render a JSON field as a textarea
  const renderJsonEditor = (field: string, label: string) => {
    let stringValue = "";
    try {
      stringValue = typeof formData[field] === 'string' 
        ? formData[field] as string 
        : JSON.stringify(formData[field] || {}, null, 2);
    } catch (e) {
      stringValue = "{}";
    }
    
    return (
      <div className="space-y-2">
        <Label htmlFor={field}>{label}</Label>
        <Textarea
          id={field}
          value={stringValue}
          onChange={(e) => handleChange(field, e.target.value)}
          rows={8}
          className={formErrors[field] ? "border-red-500" : ""}
        />
        {formErrors[field] && (
          <p className="text-xs text-red-500">{formErrors[field]}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter as valid JSON object
        </p>
      </div>
    );
  };

  // Specialized editor for eligibility criteria
  const renderEligibilityCriteriaEditor = () => {
    const criteria = formData.eligibility_criteria || {};
    const isJson = typeof criteria === 'string';
    
    if (isJson) {
      return renderJsonEditor('eligibility_criteria', 'Eligibility Criteria (JSON format)');
    }
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Eligibility Criteria</h3>
        
        <div className="space-y-2">
          <Label htmlFor="gpa_requirement">GPA Requirement</Label>
          <Input
            id="gpa_requirement"
            value={(criteria?.gpa_requirement || "")}
            onChange={(e) => handleJsonFieldChange('eligibility_criteria', 'gpa_requirement', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Academic Years</Label>
          <div className="grid grid-cols-2 gap-2">
            {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Postgraduate'].map(year => (
              <div key={year} className="flex items-center space-x-2">
                <Checkbox 
                  id={`academic_year_${year}`}
                  checked={(criteria?.academic_year || []).includes(year)}
                  onCheckedChange={(checked) => {
                    const currentYears = [...(criteria?.academic_year || [])];
                    if (checked) {
                      if (!currentYears.includes(year)) {
                        handleJsonFieldChange('eligibility_criteria', 'academic_year', [...currentYears, year]);
                      }
                    } else {
                      handleJsonFieldChange(
                        'eligibility_criteria', 
                        'academic_year', 
                        currentYears.filter(y => y !== year)
                      );
                    }
                  }}
                />
                <label htmlFor={`academic_year_${year}`}>{year}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="other_requirements">Other Requirements</Label>
          <Textarea
            id="other_requirements"
            value={(criteria?.other || "")}
            onChange={(e) => handleJsonFieldChange('eligibility_criteria', 'other', e.target.value)}
            placeholder="Enter any other eligibility requirements"
          />
        </div>
      </div>
    );
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

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load scholarship data: {error.message}
            </AlertDescription>
          </Alert>
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
                    onClick={handleCancel}
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

        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
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
                  className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-500">{formErrors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider_name">Provider</Label>
                <Input
                  id="provider_name"
                  value={formData.provider_name || ""}
                  onChange={(e) => handleChange("provider_name", e.target.value)}
                  disabled={!isEditing}
                  className={formErrors.provider_name ? "border-red-500" : ""}
                />
                {formErrors.provider_name && (
                  <p className="text-xs text-red-500">{formErrors.provider_name}</p>
                )}
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
                      <SelectItem value="Coming Soon">Coming Soon</SelectItem>
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

              {isEditing && (
                <>
                  {renderArrayEditor('category', 'Categories')}
                  {renderArrayEditor('tags', 'Tags')}
                </>
              )}

              {/* Scholarship flags */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured || false}
                    onCheckedChange={(checked) => handleChange("featured", !!checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="source_verified"
                    checked={formData.source_verified || false}
                    onCheckedChange={(checked) => handleChange("source_verified", !!checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="source_verified">Source Verified</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="renewable"
                    checked={formData.renewable || false}
                    onCheckedChange={(checked) => handleChange("renewable", !!checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="renewable">Renewable</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Eligibility Tab */}
          <TabsContent value="eligibility" className="space-y-4 py-4">
            {isEditing ? (
              renderEligibilityCriteriaEditor()
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Eligibility Criteria</h3>
                <Card>
                  <CardContent className="pt-4">
                    {formData.eligibility_criteria && typeof formData.eligibility_criteria === 'object' ? (
                      <ScrollArea className="max-h-[400px]">
                        <dl className="space-y-3">
                          {formData.eligibility_criteria.gpa_requirement && (
                            <div>
                              <dt className="font-medium">GPA Requirement:</dt>
                              <dd>{formData.eligibility_criteria.gpa_requirement}</dd>
                            </div>
                          )}
                          
                          {formData.eligibility_criteria.academic_year?.length > 0 && (
                            <div>
                              <dt className="font-medium">Academic Year:</dt>
                              <dd>{Array.isArray(formData.eligibility_criteria.academic_year) ? formData.eligibility_criteria.academic_year.join(', ') : 'Not specified'}</dd>
                            </div>
                          )}
                          
                          {formData.citizenship_requirements?.length > 0 && (
                            <div>
                              <dt className="font-medium">Citizenship Requirements:</dt>
                              <dd>{formData.citizenship_requirements.join(', ')}</dd>
                            </div>
                          )}
                          
                          {formData.demographic_requirements?.length > 0 && (
                            <div>
                              <dt className="font-medium">Demographic Requirements:</dt>
                              <dd>{formData.demographic_requirements.join(', ')}</dd>
                            </div>
                          )}
                          
                          {formData.eligibility_criteria.other && (
                            <div>
                              <dt className="font-medium">Other Requirements:</dt>
                              <dd className="whitespace-pre-wrap">{formData.eligibility_criteria.other}</dd>
                            </div>
                          )}
                        </dl>
                      </ScrollArea>
                    ) : (
                      <p>No eligibility criteria specified.</p>
                    )}
                  </CardContent>
                </Card>
                
                {isEditing ? (
                  <>
                    {renderArrayEditor('citizenship_requirements', 'Citizenship Requirements')}
                    {renderArrayEditor('demographic_requirements', 'Demographic Requirements')}
                    {renderJsonEditor('academic_requirements', 'Academic Requirements')}
                  </>
                ) : (
                  <>
                    {formData.academic_requirements && typeof formData.academic_requirements === 'object' && Object.keys(formData.academic_requirements).length > 0 && (
                      <Card className="mt-4">
                        <CardContent className="pt-4">
                          <h4 className="font-medium mb-2">Academic Requirements</h4>
                          <pre className="text-sm p-2 bg-slate-50 rounded overflow-x-auto max-w-full">
                            {JSON.stringify(formData.academic_requirements, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}
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

              {isEditing ? (
                renderArrayEditor('required_documents', 'Required Documents')
              ) : (
                <div className="space-y-2">
                  <Label>Required Documents</Label>
                  <div className="flex flex-wrap gap-1">
                    {formData.required_documents?.length ? (
                      formData.required_documents.map((doc, index) => (
                        <Badge key={index} variant="outline">
                          {doc}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No documents specified</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="award_frequency">Award Frequency</Label>
                {isEditing ? (
                  <Select
                    value={formData.award_frequency || ''}
                    onValueChange={(value) => handleChange("award_frequency", value)}
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
                ) : (
                  <p>{formData.award_frequency || 'Not specified'}</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Additional Info Tab */}
          <TabsContent value="additional" className="space-y-4 py-4">
            {isEditing ? (
              <div className="space-y-4">
                {renderJsonEditor('contact_information', 'Contact Information')}
                
                <div className="space-y-2">
                  <Label htmlFor="views_count">Views Count</Label>
                  <Input
                    id="views_count"
                    type="number"
                    value={formData.views_count || 0}
                    onChange={(e) => handleChange("views_count", parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total_applicants">Total Applicants</Label>
                  <Input
                    id="total_applicants"
                    type="number"
                    value={formData.total_applicants || 0}
                    onChange={(e) => handleChange("total_applicants", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    {formData.contact_information && typeof formData.contact_information === 'object' && Object.keys(formData.contact_information).length > 0 ? (
                      <dl className="space-y-2">
                        {Object.entries(formData.contact_information).map(([key, value]) => (
                          <div key={key}>
                            <dt className="font-medium capitalize">{key.replace('_', ' ')}:</dt>
                            <dd>{value as string}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="text-muted-foreground">No contact information provided</p>
                    )}
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Creation Date</Label>
                    <p>{formatDate(formData.created_at)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <p>{formatDate(formData.updated_at)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Views</Label>
                    <p>{formData.views_count || 0}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Applicants</Label>
                    <p>{formData.total_applicants || 0}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.category?.map((cat, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">
                        {cat}
                      </Badge>
                    ))}
                    {(!formData.category || formData.category.length === 0) && (
                      <p className="text-muted-foreground text-sm">No categories specified</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800">
                        {tag}
                      </Badge>
                    ))}
                    {(!formData.tags || formData.tags.length === 0) && (
                      <p className="text-muted-foreground text-sm">No tags specified</p>
                    )}
                  </div>
                </div>
              </div>
            )}
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
              Created: {formatDate(formData.created_at)}
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
