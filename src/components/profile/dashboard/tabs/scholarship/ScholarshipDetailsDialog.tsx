
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
import { 
  AlertCircle, Calendar, Check, ChevronDown, Loader2, Plus, Trash, X 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface ScholarshipDetailsDialogProps {
  scholarshipId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScholarshipUpdated?: () => void;
}

// Define the shape of eligibility criteria
interface EligibilityCriteria {
  gpa_requirement?: string;
  academic_year?: string[];
  citizenship?: string[];
  demographic?: string[];
  major?: string[];
  other?: string;
}

// Define the schema for academic requirements
interface AcademicRequirements {
  min_gpa?: number;
  year_of_study?: string[];
  enrollment_status?: string;
  major_restrictions?: string[];
  credits_completed?: number;
}

// Define the schema for contact information
interface ContactInformation {
  email?: string;
  phone?: string;
  website?: string;
  contact_person?: string;
  department?: string;
}

// Define the shape of our scholarship data
interface ScholarshipDetails {
  id: string;
  title: string;
  provider_name: string;
  description: string;
  amount: number | null;
  deadline: string | null;
  application_open_date: string | null;
  eligibility_criteria: EligibilityCriteria | null;
  academic_requirements: AcademicRequirements | null;
  application_url: string | null;
  application_process: string | null;
  award_frequency: string | null;
  status: string;
  featured: boolean;
  source_verified: boolean;
  renewable: boolean;
  views_count: number | null;
  total_applicants: number | null;
  created_at: string;
  updated_at: string | null;
  category: string[];
  tags: string[];
  citizenship_requirements: string[];
  demographic_requirements: string[];
  required_documents: string[];
  image_url: string | null;
  contact_information: ContactInformation | null;
}

// Define our form validation schema
const scholarshipFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  provider_name: z.string().min(1, "Provider is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.union([z.number().positive().nullish(), z.literal("")]).transform(val => val === "" ? null : val),
  status: z.string(),
  deadline: z.string().nullable(),
  application_open_date: z.string().nullable(),
  application_url: z.string().nullable(),
  application_process: z.string().nullable(),
  award_frequency: z.string().nullable(),
  featured: z.boolean(),
  source_verified: z.boolean(),
  renewable: z.boolean(),
  image_url: z.string().nullable(),
  category: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  citizenship_requirements: z.array(z.string()).default([]),
  demographic_requirements: z.array(z.string()).default([]),
  required_documents: z.array(z.string()).default([]),
  eligibility_criteria: z.any().nullable(),
  academic_requirements: z.any().nullable(),
  contact_information: z.any().nullable(),
});

// Status options
const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Pending", label: "Pending" },
  { value: "Inactive", label: "Inactive" },
  { value: "Expired", label: "Expired" },
  { value: "Coming Soon", label: "Coming Soon" }
];

// Award frequency options
const awardFrequencyOptions = [
  { value: "one-time", label: "One-time" },
  { value: "annual", label: "Annual" },
  { value: "semester", label: "Per Semester" },
  { value: "quarterly", label: "Quarterly" },
  { value: "monthly", label: "Monthly" }
];

// Common academic years
const academicYears = [
  "Freshman",
  "Sophomore",
  "Junior", 
  "Senior",
  "Graduate",
  "Postgraduate",
  "Doctoral"
];

export function ScholarshipDetailsDialog({
  scholarshipId,
  open,
  onOpenChange,
  onScholarshipUpdated
}: ScholarshipDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Form setup
  const form = useForm<z.infer<typeof scholarshipFormSchema>>({
    resolver: zodResolver(scholarshipFormSchema),
    defaultValues: {
      title: "",
      provider_name: "",
      description: "",
      amount: null,
      status: "Active",
      deadline: null,
      application_open_date: null,
      application_url: null,
      featured: false,
      source_verified: false,
      renewable: false,
      award_frequency: null,
      application_process: null,
      image_url: null,
      category: [],
      tags: [],
      citizenship_requirements: [],
      demographic_requirements: [],
      required_documents: [],
      eligibility_criteria: null,
      academic_requirements: null,
      contact_information: null,
    },
  });

  // Function to format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "yyyy-MM-dd");
    } catch {
      return "";
    }
  };

  // Function to format currency for display
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Not specified";
    return `$${amount.toLocaleString()}`;
  };

  // Function to safely render complex objects
  const safeRender = (value: any) => {
    if (value === null || value === undefined) {
      return "";
    }
    
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return "";
      }
    }
    
    return String(value);
  };

  // Fetch scholarship details
  const { data: scholarship, refetch } = useQuery({
    queryKey: ["scholarship-details", scholarshipId],
    queryFn: async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("id", scholarshipId)
        .single();

      if (error) throw error;
      return data as ScholarshipDetails;
    },
    enabled: open && !!scholarshipId,
    onSuccess: (data) => {
      // Reset the form with the scholarship data
      if (data) {
        form.reset({
          title: data.title || "",
          provider_name: data.provider_name || "",
          description: data.description || "",
          amount: data.amount,
          status: data.status || "Active",
          deadline: data.deadline ? formatDate(data.deadline) : null,
          application_open_date: data.application_open_date ? formatDate(data.application_open_date) : null,
          application_url: data.application_url,
          application_process: data.application_process,
          award_frequency: data.award_frequency,
          featured: !!data.featured,
          source_verified: !!data.source_verified,
          renewable: !!data.renewable,
          image_url: data.image_url,
          category: data.category || [],
          tags: data.tags || [],
          citizenship_requirements: data.citizenship_requirements || [],
          demographic_requirements: data.demographic_requirements || [],
          required_documents: data.required_documents || [],
          eligibility_criteria: data.eligibility_criteria,
          academic_requirements: data.academic_requirements,
          contact_information: data.contact_information,
        });
      }
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to load scholarship: ${error.message}`);
      setIsLoading(false);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<ScholarshipDetails>) => {
      const { error } = await supabase
        .from('scholarships')
        .update(updatedData)
        .eq('id', scholarshipId);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("Scholarship updated successfully");
      refetch(); // Refresh data after update
      if (onScholarshipUpdated) {
        onScholarshipUpdated();
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to update: ${error.message}`);
    }
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof scholarshipFormSchema>) => {
    // Clean up form values before submission
    const formattedValues: Partial<ScholarshipDetails> = {
      ...values,
      // Format dates properly for the database
      deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
      application_open_date: values.application_open_date ? new Date(values.application_open_date).toISOString() : null,
    };

    updateMutation.mutate(formattedValues);
  };

  // Handlers for array fields
  const handleArrayItemChange = (index: number, value: string, field: string, values: string[]) => {
    const newValues = [...values];
    newValues[index] = value;
    form.setValue(field as any, newValues, { shouldValidate: true });
  };

  const handleAddArrayItem = (field: string, values: string[]) => {
    const newValues = [...values, ""];
    form.setValue(field as any, newValues, { shouldValidate: true });
  };

  const handleRemoveArrayItem = (index: number, field: string, values: string[]) => {
    const newValues = values.filter((_, i) => i !== index);
    form.setValue(field as any, newValues, { shouldValidate: true });
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen && form.formState.isDirty) {
          if (confirm("You have unsaved changes. Are you sure you want to close?")) {
            onOpenChange(false);
          }
        } else {
          onOpenChange(isOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle className="text-xl flex justify-between items-center">
                  <span>Edit Scholarship</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="submit" 
                      disabled={updateMutation.isPending || !form.formState.isDirty}
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="w-full">
                  <TabsTrigger value="details">Basic Details</TabsTrigger>
                  <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
                  <TabsTrigger value="application">Application</TabsTrigger>
                  <TabsTrigger value="additional">Additional Info</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>
                
                {/* Basic Details Tab */}
                <TabsContent value="details" className="space-y-5 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="provider_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field: { onChange, value, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Amount ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...fieldProps}
                              value={value === null ? "" : String(value)}
                              onChange={(e) => {
                                const val = e.target.value;
                                onChange(val === "" ? null : parseFloat(val));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="award_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Award Frequency</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {awardFrequencyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          URL for the scholarship image or logo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Scholarship</FormLabel>
                            <FormDescription>
                              Show in featured sections
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="source_verified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Source Verified</FormLabel>
                            <FormDescription>
                              The scholarship source is verified
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="renewable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Renewable</FormLabel>
                            <FormDescription>
                              Scholarship can be renewed
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormLabel>Categories</FormLabel>
                    <div className="space-y-2">
                      {form.watch('category').map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={item}
                            onChange={(e) => 
                              handleArrayItemChange(index, e.target.value, 'category', form.watch('category'))
                            }
                            placeholder="Category name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveArrayItem(index, 'category', form.watch('category'))}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddArrayItem('category', form.watch('category'))}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Category
                      </Button>
                    </div>
                  </div>

                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2">
                      {form.watch('tags').map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={item}
                            onChange={(e) => 
                              handleArrayItemChange(index, e.target.value, 'tags', form.watch('tags'))
                            }
                            placeholder="Tag name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveArrayItem(index, 'tags', form.watch('tags'))}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddArrayItem('tags', form.watch('tags'))}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Tag
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Eligibility Tab */}
                <TabsContent value="eligibility" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Eligibility Criteria</h3>
                    
                    <div className="space-y-4 bg-muted/50 p-4 rounded-md">
                      <div className="space-y-2">
                        <Label>GPA Requirement</Label>
                        <Input 
                          value={(form.watch('eligibility_criteria')?.gpa_requirement || "")}
                          onChange={(e) => {
                            const current = {...form.watch('eligibility_criteria')} || {};
                            form.setValue('eligibility_criteria', {
                              ...current,
                              gpa_requirement: e.target.value
                            });
                          }}
                          placeholder="e.g., 3.0 minimum"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Academic Years</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {academicYears.map((year) => (
                            <div key={year} className="flex items-center space-x-2">
                              <Checkbox
                                id={`year-${year}`}
                                checked={(form.watch('eligibility_criteria')?.academic_year || []).includes(year)}
                                onCheckedChange={(checked) => {
                                  const current = {...form.watch('eligibility_criteria')} || {};
                                  const currentYears = current.academic_year || [];
                                  
                                  let newYears;
                                  if (checked) {
                                    newYears = [...currentYears, year];
                                  } else {
                                    newYears = currentYears.filter(y => y !== year);
                                  }
                                  
                                  form.setValue('eligibility_criteria', {
                                    ...current,
                                    academic_year: newYears
                                  });
                                }}
                              />
                              <Label htmlFor={`year-${year}`} className="text-sm">
                                {year}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Additional Requirements</Label>
                        <Textarea
                          value={(form.watch('eligibility_criteria')?.other || "")}
                          onChange={(e) => {
                            const current = {...form.watch('eligibility_criteria')} || {};
                            form.setValue('eligibility_criteria', {
                              ...current,
                              other: e.target.value
                            });
                          }}
                          placeholder="Other eligibility requirements"
                          rows={4}
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mt-4">Citizenship Requirements</h3>
                    <div className="space-y-2">
                      {form.watch('citizenship_requirements').map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={item}
                            onChange={(e) => 
                              handleArrayItemChange(
                                index, 
                                e.target.value, 
                                'citizenship_requirements', 
                                form.watch('citizenship_requirements')
                              )
                            }
                            placeholder="e.g., US Citizen, International Student"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveArrayItem(
                              index, 
                              'citizenship_requirements', 
                              form.watch('citizenship_requirements')
                            )}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddArrayItem(
                          'citizenship_requirements', 
                          form.watch('citizenship_requirements')
                        )}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Citizenship Requirement
                      </Button>
                    </div>
                    
                    <h3 className="text-lg font-medium mt-4">Demographic Requirements</h3>
                    <div className="space-y-2">
                      {form.watch('demographic_requirements').map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={item}
                            onChange={(e) => 
                              handleArrayItemChange(
                                index, 
                                e.target.value, 
                                'demographic_requirements', 
                                form.watch('demographic_requirements')
                              )
                            }
                            placeholder="e.g., Women in STEM, First-generation college student"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveArrayItem(
                              index, 
                              'demographic_requirements', 
                              form.watch('demographic_requirements')
                            )}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddArrayItem(
                          'demographic_requirements', 
                          form.watch('demographic_requirements')
                        )}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Demographic Requirement
                      </Button>
                    </div>
                    
                    <h3 className="text-lg font-medium mt-4">Academic Requirements</h3>
                    <div className="space-y-4 bg-muted/50 p-4 rounded-md">
                      <div className="space-y-2">
                        <Label>Minimum GPA</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="4.0"
                          value={(form.watch('academic_requirements')?.min_gpa || "")}
                          onChange={(e) => {
                            const current = {...form.watch('academic_requirements')} || {};
                            form.setValue('academic_requirements', {
                              ...current,
                              min_gpa: e.target.value ? parseFloat(e.target.value) : undefined
                            });
                          }}
                          placeholder="e.g., 3.5"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Enrollment Status</Label>
                        <Input 
                          value={(form.watch('academic_requirements')?.enrollment_status || "")}
                          onChange={(e) => {
                            const current = {...form.watch('academic_requirements')} || {};
                            form.setValue('academic_requirements', {
                              ...current,
                              enrollment_status: e.target.value
                            });
                          }}
                          placeholder="e.g., Full-time, Part-time"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Credits Completed</Label>
                        <Input
                          type="number"
                          min="0"
                          value={(form.watch('academic_requirements')?.credits_completed || "")}
                          onChange={(e) => {
                            const current = {...form.watch('academic_requirements')} || {};
                            form.setValue('academic_requirements', {
                              ...current,
                              credits_completed: e.target.value ? parseInt(e.target.value) : undefined
                            });
                          }}
                          placeholder="e.g., 60"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Application Tab */}
                <TabsContent value="application" className="space-y-5 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Application Deadline</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>No deadline set</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <input 
                                type="date" 
                                value={field.value || ""} 
                                onChange={(e) => field.onChange(e.target.value || null)}
                                className="p-2 w-full"
                              />
                              {field.value && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => field.onChange(null)}
                                >
                                  <X className="h-4 w-4 mr-1" /> Clear
                                </Button>
                              )}
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            The last day to submit applications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="application_open_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Application Opening Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>No opening date set</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <input 
                                type="date" 
                                value={field.value || ""} 
                                onChange={(e) => field.onChange(e.target.value || null)}
                                className="p-2 w-full"
                              />
                              {field.value && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => field.onChange(null)}
                                >
                                  <X className="h-4 w-4 mr-1" /> Clear
                                </Button>
                              )}
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When applications start being accepted
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="application_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application URL</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="https://..." />
                        </FormControl>
                        <FormDescription>
                          Direct link to the application page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="application_process"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Process</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            value={field.value || ""} 
                            placeholder="Describe the application process..."
                            rows={5}
                          />
                        </FormControl>
                        <FormDescription>
                          Step-by-step instructions for applying
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <Label>Required Documents</Label>
                    <div className="space-y-2">
                      {form.watch('required_documents').map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={item}
                            onChange={(e) => 
                              handleArrayItemChange(
                                index, 
                                e.target.value, 
                                'required_documents', 
                                form.watch('required_documents')
                              )
                            }
                            placeholder="e.g., Transcript, Essay, Recommendation Letters"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveArrayItem(index, 'required_documents', form.watch('required_documents'))}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddArrayItem('required_documents', form.watch('required_documents'))}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Required Document
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Additional Info Tab */}
                <TabsContent value="additional" className="space-y-4 mt-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="space-y-4 bg-muted/50 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Contact Email</Label>
                        <Input 
                          value={(form.watch('contact_information')?.email || "")}
                          onChange={(e) => {
                            const current = {...form.watch('contact_information')} || {};
                            form.setValue('contact_information', {
                              ...current,
                              email: e.target.value
                            });
                          }}
                          placeholder="contact@example.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Contact Phone</Label>
                        <Input 
                          value={(form.watch('contact_information')?.phone || "")}
                          onChange={(e) => {
                            const current = {...form.watch('contact_information')} || {};
                            form.setValue('contact_information', {
                              ...current,
                              phone: e.target.value
                            });
                          }}
                          placeholder="(123) 456-7890"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input 
                        value={(form.watch('contact_information')?.website || "")}
                        onChange={(e) => {
                          const current = {...form.watch('contact_information')} || {};
                          form.setValue('contact_information', {
                            ...current,
                            website: e.target.value
                          });
                        }}
                        placeholder="https://www.example.com"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Contact Person</Label>
                        <Input 
                          value={(form.watch('contact_information')?.contact_person || "")}
                          onChange={(e) => {
                            const current = {...form.watch('contact_information')} || {};
                            form.setValue('contact_information', {
                              ...current,
                              contact_person: e.target.value
                            });
                          }}
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Input 
                          value={(form.watch('contact_information')?.department || "")}
                          onChange={(e) => {
                            const current = {...form.watch('contact_information')} || {};
                            form.setValue('contact_information', {
                              ...current,
                              department: e.target.value
                            });
                          }}
                          placeholder="Financial Aid Office"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Add any other additional fields here */}
                </TabsContent>
                
                {/* Stats Tab */}
                <TabsContent value="stats" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Views</Label>
                      <p className="text-lg">{scholarship?.views_count || 0}</p>
                    </div>
                    
                    <div>
                      <Label>Applications</Label>
                      <p className="text-lg">{scholarship?.total_applicants || 0}</p>
                    </div>
                    
                    <div>
                      <Label>Created</Label>
                      <p>{scholarship?.created_at ? new Date(scholarship.created_at).toLocaleDateString() : "Unknown"}</p>
                    </div>
                    
                    <div>
                      <Label>Last Updated</Label>
                      <p>{scholarship?.updated_at ? new Date(scholarship.updated_at).toLocaleDateString() : "Not updated yet"}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-2 border-t flex flex-wrap gap-2">
                    <Badge variant={scholarship?.featured ? "default" : "outline"}>
                      {scholarship?.featured ? "Featured" : "Not Featured"}
                    </Badge>
                    <Badge variant={scholarship?.source_verified ? "success" : "outline"}>
                      {scholarship?.source_verified ? "Verified Source" : "Unverified Source"}
                    </Badge>
                    <Badge variant={scholarship?.renewable ? "secondary" : "outline"}>
                      {scholarship?.renewable ? "Renewable" : "Non-renewable"}
                    </Badge>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end mt-6 border-t pt-4">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={updateMutation.isPending || !form.formState.isDirty}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
