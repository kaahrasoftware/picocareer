import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { School, SchoolType } from "@/types/database/schools";

const schoolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "Public University",
    "Private University",
    "Community College",
    "Technical School",
    "Liberal Arts College",
    "Research University",
    "Online University",
    "For-Profit College",
    "Military Academy",
    "Art School",
    "Music School",
    "Business School",
    "Medical School",
    "Law School",
    "Other"
  ]),
  status: z.enum(["Approved", "Pending", "Rejected"]).default("Approved"),
  featured: z.boolean().default(false),
  featured_priority: z.number().default(0),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  website: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  established_year: z.number().optional(),
  student_population: z.number().optional(),
  acceptance_rate: z.number().optional(),
  tuition_in_state: z.number().optional(),
  tuition_out_of_state: z.number().optional(),
  tuition_international: z.number().optional(),
  room_and_board: z.number().optional(),
  application_fee: z.number().optional(),
  application_deadline: z.string().optional(),
  sat_range_low: z.number().optional(),
  sat_range_high: z.number().optional(),
  act_range_low: z.number().optional(),
  act_range_high: z.number().optional(),
  gpa_average: z.number().optional(),
  description: z.string().optional(),
  campus_size: z.string().optional(),
  programs_offered: z.array(z.string()).default([]),
  notable_alumni: z.array(z.string()).default([]),
  rankings: z.any().optional(),
  admissions_requirements: z.array(z.string()).default([]),
  financial_aid_available: z.boolean().default(false),
  scholarship_opportunities: z.array(z.string()).default([]),
  campus_facilities: z.array(z.string()).default([]),
  student_organizations: z.array(z.string()).default([]),
  sports_programs: z.array(z.string()).default([]),
  research_opportunities: z.boolean().default(false),
  internship_programs: z.boolean().default(false),
  study_abroad_programs: z.boolean().default(false),
  diversity_stats: z.any().optional(),
  graduation_rate: z.number().optional(),
  employment_rate: z.number().optional(),
  average_salary_after_graduation: z.number().optional(),
  notable_programs: z.array(z.string()).default([]),
  campus_culture: z.string().optional(),
  location_benefits: z.array(z.string()).default([]),
  housing_options: z.array(z.string()).default([]),
  dining_options: z.array(z.string()).default([]),
  transportation: z.array(z.string()).default([]),
  safety_measures: z.array(z.string()).default([]),
  sustainability_initiatives: z.array(z.string()).default([]),
  technology_resources: z.array(z.string()).default([]),
  library_resources: z.array(z.string()).default([]),
  health_services: z.array(z.string()).default([]),
  counseling_services: z.array(z.string()).default([]),
  career_services: z.array(z.string()).default([]),
  alumni_network_strength: z.string().optional(),
  partnerships_with_industry: z.array(z.string()).default([]),
  accreditation: z.array(z.string()).default([]),
  special_programs: z.array(z.string()).default([]),
  language_programs: z.array(z.string()).default([]),
  online_programs_available: z.boolean().default(false),
  part_time_programs_available: z.boolean().default(false),
  evening_programs_available: z.boolean().default(false),
  weekend_programs_available: z.boolean().default(false),
  summer_programs_available: z.boolean().default(false),
  continuing_education_programs: z.boolean().default(false),
  professional_development_programs: z.boolean().default(false),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

interface SchoolFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school?: School;
  onSuccess: () => void;
}

export function SchoolFormDialog({ isOpen, onClose, school, onSuccess }: SchoolFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: school?.name || "",
      type: school?.type || "Public University",
      status: (school?.status as "Approved" | "Pending" | "Rejected") || "Approved",
      featured: school?.featured || false,
      featured_priority: school?.featured_priority || 0,
      country: school?.country || "",
      state: school?.state || "",
      city: school?.city || "",
      website: school?.website || "",
      email: school?.email || "",
      phone: school?.phone || "",
      established_year: school?.established_year || 0,
      student_population: school?.student_population || 0,
      acceptance_rate: school?.acceptance_rate || 0,
      tuition_in_state: school?.tuition_in_state || 0,
      tuition_out_of_state: school?.tuition_out_of_state || 0,
      tuition_international: school?.tuition_international || 0,
      room_and_board: school?.room_and_board || 0,
      application_fee: school?.application_fee || 0,
      application_deadline: school?.application_deadline || "",
      sat_range_low: school?.sat_range_low || 0,
      sat_range_high: school?.sat_range_high || 0,
      act_range_low: school?.act_range_low || 0,
      act_range_high: school?.act_range_high || 0,
      gpa_average: school?.gpa_average || 0,
      description: school?.description || "",
      campus_size: school?.campus_size || "",
      programs_offered: school?.programs_offered || [],
      notable_alumni: school?.notable_alumni || [],
      rankings: school?.rankings || {},
      admissions_requirements: school?.admissions_requirements || [],
      financial_aid_available: school?.financial_aid_available || false,
      scholarship_opportunities: school?.scholarship_opportunities || [],
      campus_facilities: school?.campus_facilities || [],
      student_organizations: school?.student_organizations || [],
      sports_programs: school?.sports_programs || [],
      research_opportunities: school?.research_opportunities || false,
      internship_programs: school?.internship_programs || false,
      study_abroad_programs: school?.study_abroad_programs || false,
      diversity_stats: school?.diversity_stats || {},
      graduation_rate: school?.graduation_rate || 0,
      employment_rate: school?.employment_rate || 0,
      average_salary_after_graduation: school?.average_salary_after_graduation || 0,
      notable_programs: school?.notable_programs || [],
      campus_culture: school?.campus_culture || "",
      location_benefits: school?.location_benefits || [],
      housing_options: school?.housing_options || [],
      dining_options: school?.dining_options || [],
      transportation: school?.transportation || [],
      safety_measures: school?.safety_measures || [],
      sustainability_initiatives: school?.sustainability_initiatives || [],
      technology_resources: school?.technology_resources || [],
      library_resources: school?.library_resources || [],
      health_services: school?.health_services || [],
      counseling_services: school?.counseling_services || [],
      career_services: school?.career_services || [],
      alumni_network_strength: school?.alumni_network_strength || "",
      partnerships_with_industry: school?.partnerships_with_industry || [],
      accreditation: school?.accreditation || [],
      special_programs: school?.special_programs || [],
      language_programs: school?.language_programs || [],
      online_programs_available: school?.online_programs_available || false,
      part_time_programs_available: school?.part_time_programs_available || false,
      evening_programs_available: school?.evening_programs_available || false,
      weekend_programs_available: school?.weekend_programs_available || false,
      summer_programs_available: school?.summer_programs_available || false,
      continuing_education_programs: school?.continuing_education_programs || false,
      professional_development_programs: school?.professional_development_programs || false,
    },
  });

  const onSubmit = async (data: SchoolFormData) => {
    try {
      setIsSubmitting(true);

      const schoolData = {
        name: data.name,
        type: data.type,
        status: data.status,
        state: data.state,
        acceptance_rate: data.acceptance_rate,
        student_population: data.student_population,
        featured_priority: data.featured_priority,
        country: data.country || "",
        city: data.city || "",
        website: data.website || "",
        email: data.email || "",
        phone: data.phone || "",
        established_year: data.established_year || 0,
        tuition_in_state: data.tuition_in_state || 0,
        tuition_out_of_state: data.tuition_out_of_state || 0,
        tuition_international: data.tuition_international || 0,
        room_and_board: data.room_and_board || 0,
        application_fee: data.application_fee || 0,
        application_deadline: data.application_deadline || "",
        description: data.description || "",
        updated_at: new Date().toISOString(),
        sat_range_low: data.sat_range_low || 0,
        sat_range_high: data.sat_range_high || 0,
        act_range_low: data.act_range_low || 0,
        act_range_high: data.act_range_high || 0,
        gpa_average: data.gpa_average || 0,
        campus_size: data.campus_size || "",
        programs_offered: data.programs_offered || [],
        notable_alumni: data.notable_alumni || [],
        rankings: data.rankings || {},
        admissions_requirements: data.admissions_requirements || [],
        financial_aid_available: data.financial_aid_available || false,
        scholarship_opportunities: data.scholarship_opportunities || [],
        campus_facilities: data.campus_facilities || [],
        student_organizations: data.student_organizations || [],
        sports_programs: data.sports_programs || [],
        research_opportunities: data.research_opportunities || false,
        internship_programs: data.internship_programs || false,
        study_abroad_programs: data.study_abroad_programs || false,
        diversity_stats: data.diversity_stats || {},
        graduation_rate: data.graduation_rate || 0,
        employment_rate: data.employment_rate || 0,
        average_salary_after_graduation: data.average_salary_after_graduation || 0,
        notable_programs: data.notable_programs || [],
        campus_culture: data.campus_culture || "",
        location_benefits: data.location_benefits || [],
        housing_options: data.housing_options || [],
        dining_options: data.dining_options || [],
        transportation: data.transportation || [],
        safety_measures: data.safety_measures || [],
        sustainability_initiatives: data.sustainability_initiatives || [],
        technology_resources: data.technology_resources || [],
        library_resources: data.library_resources || [],
        health_services: data.health_services || [],
        counseling_services: data.counseling_services || [],
        career_services: data.career_services || [],
        alumni_network_strength: data.alumni_network_strength || "",
        partnerships_with_industry: data.partnerships_with_industry || [],
        accreditation: data.accreditation || [],
        special_programs: data.special_programs || [],
        language_programs: data.language_programs || [],
        online_programs_available: data.online_programs_available || false,
        part_time_programs_available: data.part_time_programs_available || false,
        evening_programs_available: data.evening_programs_available || false,
        weekend_programs_available: data.weekend_programs_available || false,
        summer_programs_available: data.summer_programs_available || false,
        continuing_education_programs: data.continuing_education_programs || false,
        professional_development_programs: data.professional_development_programs || false,
      };

      if (school) {
        const { error } = await supabase
          .from('schools')
          .update(schoolData)
          .eq('id', school.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('schools')
          .insert([schoolData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `School ${school ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving school:', error);
      toast({
        title: "Error",
        description: "Failed to save school. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{school ? 'Edit School' : 'Create New School'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter school name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Public University">Public University</SelectItem>
                        <SelectItem value="Private University">Private University</SelectItem>
                        <SelectItem value="Community College">Community College</SelectItem>
                        <SelectItem value="Technical School">Technical School</SelectItem>
                        <SelectItem value="Liberal Arts College">Liberal Arts College</SelectItem>
                        <SelectItem value="Research University">Research University</SelectItem>
                        <SelectItem value="Online University">Online University</SelectItem>
                        <SelectItem value="For-Profit College">For-Profit College</SelectItem>
                        <SelectItem value="Military Academy">Military Academy</SelectItem>
                        <SelectItem value="Art School">Art School</SelectItem>
                        <SelectItem value="Music School">Music School</SelectItem>
                        <SelectItem value="Business School">Business School</SelectItem>
                        <SelectItem value="Medical School">Medical School</SelectItem>
                        <SelectItem value="Law School">Law School</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                      <FormDescription>
                        Mark this school as featured
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured_priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Priority</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Priority for featured schools (lower number = higher priority)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (school ? 'Update School' : 'Create School')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
