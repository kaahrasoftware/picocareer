
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, Plus, CalendarIcon, Building, School, Award, Pencil, Info, Bookmark, Contact, Tags } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuthState } from "@/hooks/useAuthState";
import { RichTextEditor } from "@/components/forms/RichTextEditor";

const SCHOLARSHIP_CATEGORIES = [
  "Academic Excellence",
  "Athletic",
  "Community Service",
  "STEM",
  "Arts",
  "First Generation",
  "Minority",
  "Women",
  "International",
  "Military",
  "Study Abroad",
  "Graduate",
  "Undergraduate",
  "Merit-Based",
  "Need-Based",
  "Research",
];

const DEMOGRAPHIC_TAGS = [
  "Women",
  "BIPOC",
  "LGBTQ+",
  "Veterans",
  "Disabled",
  "First Generation",
  "Low-Income",
  "International",
  "Non-Traditional Students",
  "Returning Students"
];

const CITIZENSHIP_OPTIONS = [
  "US Citizens",
  "US Permanent Residents",
  "International Students",
  "DACA Recipients",
  "No Restrictions",
];

const REQUIRED_DOCUMENTS = [
  "Transcript",
  "Essay",
  "Recommendation Letter",
  "Resume/CV",
  "Portfolio",
  "Financial Aid Documents",
  "Test Scores",
  "Proof of Enrollment",
  "Proof of Citizenship",
];

const scholarshipSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  provider_name: z.string().min(2, "Provider name is required"),
  amount: z.union([z.number().positive(), z.null()]).optional(),
  deadline: z.date().optional(),
  status: z.enum(["Active", "Expired", "Coming Soon"]),
  application_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  application_open_date: z.date().optional(),
  application_process: z.string().optional(),
  award_frequency: z.string().optional(),
  renewable: z.boolean().default(false),
  contact_information: z.object({
    email: z.string().email("Must be a valid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  }).optional(),
  demographic_requirements: z.array(z.string()).optional(),
  citizenship_requirements: z.array(z.string()).optional(),
  required_documents: z.array(z.string()).optional(),
  academic_requirements: z.object({
    gpa: z.string().optional(),
    major: z.string().optional(),
    year: z.string().optional(),
  }).optional(),
  eligibility_criteria: z.object({
    age: z.string().optional(),
    location: z.string().optional(),
    other: z.string().optional(),
  }).optional(),
});

type ScholarshipFormValues = z.infer<typeof scholarshipSchema>;

interface ScholarshipFormProps {
  scholarship?: any; // The scholarship to edit, if any
}

export function ScholarshipForm({ scholarship }: ScholarshipFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthState();
  const [activeTab, setActiveTab] = useState("basic");
  const [tags, setTags] = useState<string[]>(scholarship?.tags || []);
  const [categories, setCategories] = useState<string[]>(scholarship?.category || []);
  const [demographic, setDemographic] = useState<string[]>(scholarship?.demographic_requirements || []);
  const [citizenship, setCitizenship] = useState<string[]>(scholarship?.citizenship_requirements || []);
  const [documents, setDocuments] = useState<string[]>(scholarship?.required_documents || []);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(scholarshipSchema),
    defaultValues: {
      title: scholarship?.title || "",
      description: scholarship?.description || "",
      provider_name: scholarship?.provider_name || "",
      amount: scholarship?.amount || null,
      deadline: scholarship?.deadline ? new Date(scholarship.deadline) : undefined,
      status: scholarship?.status || "Active",
      application_url: scholarship?.application_url || "",
      application_open_date: scholarship?.application_open_date
        ? new Date(scholarship.application_open_date)
        : undefined,
      application_process: scholarship?.application_process || "",
      award_frequency: scholarship?.award_frequency || "",
      renewable: scholarship?.renewable || false,
      contact_information: scholarship?.contact_information || {
        email: "",
        phone: "",
        website: "",
      },
      demographic_requirements: scholarship?.demographic_requirements || [],
      citizenship_requirements: scholarship?.citizenship_requirements || [],
      required_documents: scholarship?.required_documents || [],
      academic_requirements: scholarship?.academic_requirements || {
        gpa: "",
        major: "",
        year: "",
      },
      eligibility_criteria: scholarship?.eligibility_criteria || {
        age: "",
        location: "",
        other: "",
      },
    },
  });

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCategorySelect = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    } else {
      setCategories(categories.filter((c) => c !== category));
    }
  };

  const handleDemographicSelect = (option: string) => {
    if (!demographic.includes(option)) {
      setDemographic([...demographic, option]);
    } else {
      setDemographic(demographic.filter((d) => d !== option));
    }
  };

  const handleCitizenshipSelect = (option: string) => {
    if (!citizenship.includes(option)) {
      setCitizenship([...citizenship, option]);
    } else {
      setCitizenship(citizenship.filter((c) => c !== option));
    }
  };

  const handleDocumentSelect = (doc: string) => {
    if (!documents.includes(doc)) {
      setDocuments([...documents, doc]);
    } else {
      setDocuments(documents.filter((d) => d !== doc));
    }
  };

  const onSubmit = async (data: ScholarshipFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to submit a scholarship.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const scholarshipData = {
        ...data,
        category: categories,
        tags,
        demographic_requirements: demographic,
        citizenship_requirements: citizenship,
        required_documents: documents,
        author_id: user.id,
      };

      let response;

      if (scholarship) {
        response = await supabase
          .from("scholarships")
          .update(scholarshipData)
          .eq("id", scholarship.id);
      } else {
        response = await supabase.from("scholarships").insert(scholarshipData);
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: scholarship ? "Scholarship updated" : "Scholarship created",
        description: scholarship
          ? "The scholarship has been successfully updated."
          : "Your scholarship has been successfully submitted.",
      });

      navigate("/scholarships");
    } catch (error: any) {
      console.error("Error submitting scholarship:", error);
      toast({
        title: "Submission failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextTab = (current: string) => {
    const tabs = ["basic", "eligibility", "application", "categories", "contact"];
    const currentIndex = tabs.indexOf(current);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = (current: string) => {
    const tabs = ["basic", "eligibility", "application", "categories", "contact"];
    const currentIndex = tabs.indexOf(current);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="basic" className="flex gap-2 items-center">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="flex gap-2 items-center">
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">Eligibility</span>
            </TabsTrigger>
            <TabsTrigger value="application" className="flex gap-2 items-center">
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Application</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex gap-2 items-center">
              <Tags className="h-4 w-4" />
              <span className="hidden sm:inline">Categorization</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex gap-2 items-center">
              <Contact className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Basic Scholarship Information
                </CardTitle>
                <CardDescription>
                  Enter the fundamental details about this scholarship opportunity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scholarship Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter scholarship title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <RichTextEditor 
                          value={field.value} 
                          onChange={field.onChange} 
                          placeholder="Describe the scholarship"
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of the scholarship, its purpose, and benefits.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="provider_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of the organization" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Scholarship amount in USD"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? null : parseFloat(value));
                            }}
                            value={field.value === null ? "" : field.value}
                          />
                        </FormControl>
                        <FormDescription>Leave empty if amount varies</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                            <SelectItem value="Expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
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
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="How often is this awarded?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Annual">Annual</SelectItem>
                            <SelectItem value="Biannual">Biannual</SelectItem>
                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="One-time">One-time</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="renewable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Renewable</FormLabel>
                        <FormDescription>
                          Can this scholarship be renewed for multiple years?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="button" onClick={() => nextTab("basic")}>
                    Next: Eligibility
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eligibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Eligibility Requirements
                </CardTitle>
                <CardDescription>
                  Specify who is eligible to apply for this scholarship
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Demographic Requirements</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {demographic.map((item) => (
                      <Badge
                        key={item}
                        className="bg-blue-50 hover:bg-blue-100"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleDemographicSelect(item)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {DEMOGRAPHIC_TAGS.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={demographic.includes(option) ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => handleDemographicSelect(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Citizenship Requirements</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {citizenship.map((item) => (
                      <Badge
                        key={item}
                        className="bg-green-50 hover:bg-green-100"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleCitizenshipSelect(item)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {CITIZENSHIP_OPTIONS.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={citizenship.includes(option) ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => handleCitizenshipSelect(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="academic_requirements.gpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum GPA</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="academic_requirements.major"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Major/Field of Study</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Engineering, Arts" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="academic_requirements.year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Year</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Freshman">Freshman</SelectItem>
                            <SelectItem value="Sophomore">Sophomore</SelectItem>
                            <SelectItem value="Junior">Junior</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="Graduate">Graduate</SelectItem>
                            <SelectItem value="Any">Any</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="eligibility_criteria.age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Requirement</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 18-25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eligibility_criteria.location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location/State</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., California, Northeast" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eligibility_criteria.other"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Criteria</FormLabel>
                        <FormControl>
                          <RichTextEditor 
                            value={field.value || ""} 
                            onChange={field.onChange}
                            placeholder="Any other eligibility criteria"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => prevTab("eligibility")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => nextTab("eligibility")}>
                    Next: Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="application" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5" />
                  Application Details
                </CardTitle>
                <CardDescription>
                  Provide information about how to apply for this scholarship
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Deadline</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${
                                  !field.value ? "text-muted-foreground" : ""
                                }`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  "Select deadline date"
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="application_open_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Opening Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${
                                  !field.value ? "text-muted-foreground" : ""
                                }`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  "Select opening date"
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                        <Input
                          placeholder="https://example.com/apply"
                          {...field}
                        />
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
                        <RichTextEditor 
                          value={field.value || ""} 
                          onChange={field.onChange}
                          placeholder="Describe the application process"
                        />
                      </FormControl>
                      <FormDescription>
                        Provide step-by-step instructions for applicants
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Required Documents</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {documents.map((doc) => (
                      <Badge
                        key={doc}
                        className="bg-purple-50 hover:bg-purple-100"
                      >
                        {doc}
                        <button
                          type="button"
                          onClick={() => handleDocumentSelect(doc)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REQUIRED_DOCUMENTS.map((doc) => (
                      <Button
                        key={doc}
                        type="button"
                        variant={documents.includes(doc) ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => handleDocumentSelect(doc)}
                      >
                        {doc}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => prevTab("application")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => nextTab("application")}>
                    Next: Categories
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Categorization
                </CardTitle>
                <CardDescription>
                  Add categories and tags to help students find this scholarship
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Categories</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select categories that apply to this scholarship
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {categories.map((category) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="bg-blue-50 hover:bg-blue-100"
                        >
                          {category}
                          <button
                            type="button"
                            onClick={() => handleCategorySelect(category)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
                      {SCHOLARSHIP_CATEGORIES.map((category) => (
                        <Button
                          key={category}
                          type="button"
                          variant={categories.includes(category) ? "default" : "outline"}
                          size="sm"
                          className="justify-start"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Tags</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add tags to help students find this scholarship
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-gray-100 text-gray-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription className="mt-2">
                      Press Enter or click the button to add a tag
                    </FormDescription>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => prevTab("categories")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => nextTab("categories")}>
                    Next: Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contact className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Provide contact details for inquiries about this scholarship
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contact_information.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_information.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contact_information.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => prevTab("contact")}>
                    Previous
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : scholarship ? "Update Scholarship" : "Create Scholarship"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
