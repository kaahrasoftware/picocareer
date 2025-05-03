
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  eligibility_criteria: string | null;
  application_url: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  featured: boolean;
  source_verified: boolean;
  views_count: number | null;
  total_applicants: number | null;
}

export function ScholarshipDetailsDialog({
  scholarshipId,
  open,
  onOpenChange,
  onScholarshipUpdated
}: ScholarshipDetailsDialogProps) {
  const [scholarship, setScholarship] = useState<ScholarshipDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedScholarship, setEditedScholarship] = useState<ScholarshipDetails | null>(null);

  useEffect(() => {
    if (open && scholarshipId) {
      fetchScholarshipDetails();
    }
  }, [open, scholarshipId]);

  const fetchScholarshipDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', scholarshipId)
        .single();

      if (error) throw error;
      
      setScholarship(data);
      setEditedScholarship(data);
    } catch (error: any) {
      toast.error(`Error loading scholarship details: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<ScholarshipDetails>) => {
      const { error } = await supabase
        .from('scholarships')
        .update(updatedData)
        .eq('id', scholarshipId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Scholarship updated successfully");
      fetchScholarshipDetails(); // Refresh data
      setIsEditing(false);
      if (onScholarshipUpdated) {
        onScholarshipUpdated(); // Trigger refresh in parent component
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to update: ${error.message}`);
    }
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (!editedScholarship) return;

    setEditedScholarship({
      ...editedScholarship,
      [name]: value
    });
  };

  const handleSave = () => {
    if (!editedScholarship) return;
    
    // Only send changed fields
    const changedFields = Object.entries(editedScholarship).reduce((acc, [key, value]) => {
      if (scholarship && scholarship[key as keyof ScholarshipDetails] !== value) {
        acc[key as keyof ScholarshipDetails] = value;
      }
      return acc;
    }, {} as Partial<ScholarshipDetails>);
    
    if (Object.keys(changedFields).length > 0) {
      updateMutation.mutate(changedFields);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedScholarship(scholarship);
    setIsEditing(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString();
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (amount === null) return "Not specified";
    return `${currency || '$'}${amount.toLocaleString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      // Refresh data when dialog is opened to get the latest changes
      if (isOpen && scholarshipId) {
        fetchScholarshipDetails();
      }
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : scholarship ? (
          <>
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  {isEditing ? (
                    <Input 
                      name="title"
                      value={editedScholarship?.title || ""}
                      onChange={handleInputChange}
                      className="text-xl font-semibold"
                    />
                  ) : (
                    <DialogTitle className="text-xl">{scholarship.title}</DialogTitle>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant={scholarship.status === "Active" ? "default" : scholarship.status === "Pending" ? "outline" : "secondary"}>
                      {scholarship.status}
                    </Badge>
                    {scholarship.featured && (
                      <Badge variant="success">Featured</Badge>
                    )}
                    {scholarship.source_verified && (
                      <Badge variant="secondary">Verified Source</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="mt-6">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    {isEditing ? (
                      <Input 
                        id="provider"
                        name="provider_name"
                        value={editedScholarship?.provider_name || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p>{scholarship.provider_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    {isEditing ? (
                      <Input 
                        id="amount"
                        name="amount"
                        type="number"
                        value={editedScholarship?.amount || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p>{formatCurrency(scholarship.amount, scholarship.currency)}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    {isEditing ? (
                      <Input 
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={editedScholarship?.deadline?.split('T')[0] || ""}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p>{formatDate(scholarship.deadline)}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    {isEditing ? (
                      <select
                        id="status"
                        name="status"
                        value={editedScholarship?.status || ""}
                        onChange={e => handleInputChange(e as any)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    ) : (
                      <p>{scholarship.status}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="application_url">Application URL</Label>
                  {isEditing ? (
                    <Input 
                      id="application_url"
                      name="application_url"
                      value={editedScholarship?.application_url || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="break-all">
                      {scholarship.application_url ? (
                        <a 
                          href={scholarship.application_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {scholarship.application_url}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea 
                      id="description"
                      name="description"
                      value={editedScholarship?.description || ""}
                      onChange={handleInputChange}
                      className="min-h-[150px]"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{scholarship.description}</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="eligibility" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
                  {isEditing ? (
                    <Textarea 
                      id="eligibility_criteria"
                      name="eligibility_criteria"
                      value={editedScholarship?.eligibility_criteria || ""}
                      onChange={handleInputChange}
                      className="min-h-[200px]"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">
                      {scholarship.eligibility_criteria || "No eligibility criteria specified."}
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Views</Label>
                    <p>{scholarship.views_count || 0}</p>
                  </div>
                  
                  <div>
                    <Label>Applications</Label>
                    <p>{scholarship.total_applicants || 0}</p>
                  </div>
                  
                  <div>
                    <Label>Created</Label>
                    <p>{formatDate(scholarship.created_at)}</p>
                  </div>
                  
                  <div>
                    <Label>Last Updated</Label>
                    <p>{formatDate(scholarship.updated_at)}</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="featured">Featured</Label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2 mt-2">
                        <input 
                          type="checkbox" 
                          id="featured"
                          name="featured"
                          checked={editedScholarship?.featured || false}
                          onChange={(e) => {
                            setEditedScholarship(prev => prev ? {
                              ...prev,
                              featured: e.target.checked
                            } : null);
                          }}
                          className="h-4 w-4"
                        />
                        <span>Mark as featured</span>
                      </div>
                    ) : (
                      <p>{scholarship.featured ? "Yes" : "No"}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="source_verified">Verified Source</Label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2 mt-2">
                        <input 
                          type="checkbox" 
                          id="source_verified"
                          name="source_verified"
                          checked={editedScholarship?.source_verified || false}
                          onChange={(e) => {
                            setEditedScholarship(prev => prev ? {
                              ...prev,
                              source_verified: e.target.checked
                            } : null);
                          }}
                          className="h-4 w-4"
                        />
                        <span>Verify source</span>
                      </div>
                    ) : (
                      <p>{scholarship.source_verified ? "Yes" : "No"}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Scholarship not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
