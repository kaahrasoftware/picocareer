
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Filter, SearchIcon, X, ChevronDown, ChevronUp, GraduationCap, Users, Award, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

const filterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  amount: z.string().optional(),
  status: z.string().optional(),
  deadline: z.date().optional(),
  // Advanced filters
  citizenship: z.array(z.string()).default([]),
  demographic: z.array(z.string()).default([]),
  academic_year: z.array(z.string()).default([]),
  major: z.array(z.string()).default([]),
  gpa_requirement: z.string().optional(),
  renewable: z.boolean().optional(),
  award_frequency: z.string().optional(),
  application_process_length: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

interface ScholarshipFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  categories: string[];
}

export function ScholarshipFilters({ onFilterChange, categories }: ScholarshipFiltersProps) {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: "",
      category: "all",
      amount: "all",
      status: "Active",
      citizenship: [],
      demographic: [],
      academic_year: [],
      major: [],
      renewable: undefined,
    },
  });

  const { watch, reset } = form;
  const values = watch();

  // These are common academic years for scholarships
  const academicYearOptions = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Postgraduate"];
  
  // Common majors for filtering
  const majorOptions = [
    "Engineering", 
    "Computer Science", 
    "Business", 
    "Medicine", 
    "Law", 
    "Arts", 
    "Humanities", 
    "Social Sciences", 
    "Natural Sciences",
    "Education"
  ];

  // Common citizenships for filtering
  const citizenshipOptions = ["US Citizen", "Permanent Resident", "International Student", "DACA Recipients"];
  
  // Common demographic groups for scholarships
  const demographicOptions = [
    "Women", 
    "BIPOC", 
    "Hispanic/Latino", 
    "African American", 
    "Asian American", 
    "Native American", 
    "LGBTQ+", 
    "First Generation", 
    "Low Income", 
    "Veterans",
    "Students with Disabilities"
  ];
  
  // Award frequency options
  const awardFrequencyOptions = ["One-time", "Annual", "Semester", "Quarterly", "Monthly"];
  
  // Application process length options
  const applicationProcessOptions = ["Simple (less than 30 min)", "Medium (30-60 min)", "Complex (1+ hour)"];

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (values.search) count++;
    if (values.category && values.category !== "all") count++;
    if (values.amount && values.amount !== "all") count++;
    if (values.status && values.status !== "all") count++;
    if (values.deadline) count++;
    if (values.citizenship.length > 0) count++;
    if (values.demographic.length > 0) count++;
    if (values.academic_year.length > 0) count++;
    if (values.major.length > 0) count++;
    if (values.gpa_requirement) count++;
    if (values.renewable !== undefined) count++;
    if (values.award_frequency) count++;
    if (values.application_process_length) count++;

    setActiveFiltersCount(count);
    onFilterChange(values);
  }, [values, onFilterChange]);

  const handleResetFilters = () => {
    reset({
      search: "",
      category: "all",
      amount: "all",
      status: "Active",
      deadline: undefined,
      citizenship: [],
      demographic: [],
      academic_year: [],
      major: [],
      gpa_requirement: undefined,
      renewable: undefined,
      award_frequency: undefined,
      application_process_length: undefined,
    });
  };

  return (
    <Form {...form}>
      <div className="bg-card border rounded-lg shadow-sm p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        placeholder="Search scholarships..."
                        className="pl-9"
                        {...field}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Amount</SelectItem>
                      <SelectItem value="under5000">Under $5,000</SelectItem>
                      <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                      <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                      <SelectItem value="over25000">Over $25,000</SelectItem>
                      <SelectItem value="fulltuition">Full Tuition</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-[190px] justify-start text-left font-normal ${
                            !field.value ? "text-muted-foreground" : ""
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            "Deadline before..."
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <Collapsible 
              className="w-full" 
              open={showAdvancedFilters}
              onOpenChange={setShowAdvancedFilters}
            >
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Filter className="h-4 w-4 mr-1" />
                  Advanced Filters
                  {showAdvancedFilters ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4 space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {/* Academic Requirements Section */}
                  <AccordionItem value="academic">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        <span>Academic Requirements</span>
                        {(values.academic_year.length > 0 || values.major.length > 0 || values.gpa_requirement) && (
                          <Badge variant="secondary" className="ml-2">
                            {(values.academic_year.length > 0 ? 1 : 0) + 
                            (values.major.length > 0 ? 1 : 0) + 
                            (values.gpa_requirement ? 1 : 0)}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-2">
                        {/* Academic Year */}
                        <FormField
                          control={form.control}
                          name="academic_year"
                          render={() => (
                            <FormItem>
                              <div className="mb-2">
                                <FormLabel>Academic Year</FormLabel>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {academicYearOptions.map((year) => (
                                  <FormField
                                    key={year}
                                    control={form.control}
                                    name="academic_year"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={year}
                                          className="flex flex-row items-start space-x-2 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(year)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, year])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== year
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            {year}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* Field of Study / Major */}
                        <FormField
                          control={form.control}
                          name="major"
                          render={() => (
                            <FormItem>
                              <div className="mb-2">
                                <FormLabel>Field of Study</FormLabel>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {majorOptions.map((major) => (
                                  <FormField
                                    key={major}
                                    control={form.control}
                                    name="major"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={major}
                                          className="flex flex-row items-start space-x-2 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(major)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, major])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== major
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            {major}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* GPA Requirement */}
                        <FormField
                          control={form.control}
                          name="gpa_requirement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum GPA</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Any GPA" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Any GPA</SelectItem>
                                  <SelectItem value="2.5">2.5+</SelectItem>
                                  <SelectItem value="3.0">3.0+</SelectItem>
                                  <SelectItem value="3.5">3.5+</SelectItem>
                                  <SelectItem value="4.0">4.0 Only</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Demographic Filters Section */}
                  <AccordionItem value="demographic">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Eligibility & Demographics</span>
                        {(values.citizenship.length > 0 || values.demographic.length > 0) && (
                          <Badge variant="secondary" className="ml-2">
                            {(values.citizenship.length > 0 ? 1 : 0) + 
                            (values.demographic.length > 0 ? 1 : 0)}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-2">
                        {/* Citizenship */}
                        <FormField
                          control={form.control}
                          name="citizenship"
                          render={() => (
                            <FormItem>
                              <div className="mb-2">
                                <FormLabel>Citizenship Requirements</FormLabel>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {citizenshipOptions.map((citizenship) => (
                                  <FormField
                                    key={citizenship}
                                    control={form.control}
                                    name="citizenship"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={citizenship}
                                          className="flex flex-row items-start space-x-2 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(citizenship)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, citizenship])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== citizenship
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            {citizenship}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* Demographics */}
                        <FormField
                          control={form.control}
                          name="demographic"
                          render={() => (
                            <FormItem>
                              <div className="mb-2">
                                <FormLabel>Demographic Groups</FormLabel>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {demographicOptions.map((demo) => (
                                  <FormField
                                    key={demo}
                                    control={form.control}
                                    name="demographic"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={demo}
                                          className="flex flex-row items-start space-x-2 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(demo)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, demo])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== demo
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            {demo}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Award Details Section */}
                  <AccordionItem value="award">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        <span>Award Details</span>
                        {(values.renewable !== undefined || values.award_frequency) && (
                          <Badge variant="secondary" className="ml-2">
                            {(values.renewable !== undefined ? 1 : 0) + 
                            (values.award_frequency ? 1 : 0)}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-2">
                        {/* Award Frequency */}
                        <FormField
                          control={form.control}
                          name="award_frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Award Frequency</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Any Frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Any Frequency</SelectItem>
                                  {awardFrequencyOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        {/* Renewable */}
                        <FormField
                          control={form.control}
                          name="renewable"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0 pt-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Renewable scholarships only
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Application Process Section */}
                  <AccordionItem value="application">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Application Process</span>
                        {values.application_process_length && (
                          <Badge variant="secondary" className="ml-2">
                            1
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-2">
                        {/* Application Process Length */}
                        <FormField
                          control={form.control}
                          name="application_process_length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Application Complexity</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Any Complexity" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Any Complexity</SelectItem>
                                  {applicationProcessOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CollapsibleContent>
            </Collapsible>

            {activeFiltersCount > 0 && (
              <div className="ml-auto flex items-center">
                <Badge variant="secondary" className="mr-2">
                  {activeFiltersCount} {activeFiltersCount === 1 ? "filter" : "filters"} active
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
}
